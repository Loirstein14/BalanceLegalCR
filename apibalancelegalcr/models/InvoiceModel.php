<?php
class InvoiceModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //facturas de la sucursal del encargado
    public function getByBranch($idBranch)
    {
        try {
            $vSql = "SELECT i.id, i.status_id, s.name AS status, i.client_id,
                            COALESCE(i.invoice_number, CONCAT('Proforma #', i.id)) AS number,
                            DATE_FORMAT(COALESCE(i.issued_at, i.created_at), '%d/%m/%Y') AS invoice_date,
                            COALESCE(i.issued_at, i.created_at) AS invoice_datetime,
                            CONCAT(u.first_name, ' ', u.last_name) AS client,
                            b.name AS branch,
                            i.total
                     FROM invoices i, users u, invoice_statuses s, branches b
                     WHERE i.client_id = u.id
                       AND i.status_id = s.id
                       AND i.branch_id = b.id
                       AND i.branch_id = ?
                     ORDER BY invoice_datetime DESC, i.id DESC;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //factura por id con sus líneas y totales
    public function get($id)
    {
        try {
            $itemM = new InvoiceItemModel();
            //estos ids se ocupan para facturar la proforma
            $vSql = "SELECT i.id, i.status_id, i.client_id, i.branch_id, i.appointment_id,
                            COALESCE(i.invoice_number, CONCAT('Proforma #', i.id)) AS number,
                            s.name AS status,
                            DATE_FORMAT(COALESCE(i.issued_at, i.created_at), '%d/%m/%Y') AS invoice_date,
                            CONCAT(u.first_name, ' ', u.last_name) AS client_name,
                            u.id_number AS client_id_number,
                            u.email AS client_email,
                            b.name AS branch_name, b.phone AS branch_phone,
                            b.address AS branch_address, b.email AS branch_email,
                            bs.business_name, bs.tax_rate,
                            i.subtotal, i.tax_total, i.total
                     FROM invoices i, users u, branches b, invoice_statuses s, business_settings bs
                     WHERE i.client_id = u.id
                       AND i.branch_id = b.id
                       AND i.status_id = s.id
                       AND bs.id = 1
                       AND i.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                //líneas de detalle --items
                $vResultado->items = $itemM->getByInvoice($vResultado->id);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //porcentaje de impuesto del negocio
    public function getTaxRate()
    {
        try {
            $vSql = "SELECT tax_rate FROM business_settings WHERE id = 1;";
            return $this->enlace->ExecuteSQL($vSql)[0]->tax_rate;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //siguiente número de factura FAC
    public function nextNumber()
    {
        try {
            $vSql = "SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED)), 0) + 1 AS next
                     FROM invoices
                     WHERE invoice_number LIKE 'FAC-%';";
            $next = $this->enlace->ExecuteSQL($vSql)[0]->next;
            return 'FAC-' . str_pad($next, 4, '0', STR_PAD_LEFT);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //calcula líneas y totales con los precios de la BD
    public function calculateLines($items)
    {
        try {
            $productM = new ProductModel();
            $serviceM = new ServiceModel();
            $taxRate = $this->getTaxRate();
            $lines = [];
            $subtotal = 0;
            $taxTotal = 0;
            foreach ($items as $item) {
                //de aquí salen el nombre y el precio de este momento
                if (!empty($item->product_id)) {
                    $row = $productM->get($item->product_id);
                } else {
                    $row = $serviceM->get($item->service_id);
                }
                $lineSubtotal = round($row->price * $item->quantity, 2);
                $lineTax = round($lineSubtotal * $taxRate / 100, 2);
                $lines[] = (object) [
                    'product_id' => !empty($item->product_id) ? $item->product_id : null,
                    'service_id' => !empty($item->product_id) ? null : $item->service_id,
                    'description' => $row->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $row->price,
                    'tax_rate' => $taxRate,
                    'line_subtotal' => $lineSubtotal,
                    'line_tax' => $lineTax,
                    'line_total' => $lineSubtotal + $lineTax,
                ];
                $subtotal += $lineSubtotal;
                $taxTotal += $lineTax;
            }
            return (object) [
                'lines' => $lines,
                'subtotal' => round($subtotal, 2),
                'tax_total' => round($taxTotal, 2),
                'total' => round($subtotal + $taxTotal, 2),
            ];
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //guardar las líneas de la factura
    public function createItems($idInvoice, $lines)
    {
        try {
            $sql = "INSERT INTO invoice_items
                        (invoice_id, product_id, service_id, description, quantity, unit_price, tax_rate,
                         line_subtotal, line_tax, line_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            foreach ($lines as $line) {
                $this->enlace->executeSQL_DML($sql, [
                    $idInvoice, $line->product_id, $line->service_id, $line->description, $line->quantity,
                    $line->unit_price, $line->tax_rate, $line->line_subtotal, $line->line_tax, $line->line_total,
                ]);
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //proforma con el servicio de la reserva
    public function createProforma($idAppointment, $idClient, $idBranch, $service)
    {
        try {
            //se calcula igual que una factura normal
            $calc = $this->calculateLines([(object) ['service_id' => $service->id, 'quantity' => 1]]);
            //estado 1 = proforma
            $sql = "INSERT INTO invoices (appointment_id, client_id, branch_id, status_id, subtotal, tax_total, total)
                    VALUES (?, ?, ?, 1, ?, ?, ?);";
            $idInvoice = $this->enlace->executeSQL_DML_last($sql, [
                $idAppointment, $idClient, $idBranch, $calc->subtotal, $calc->tax_total, $calc->total,
            ]);
            $this->createItems($idInvoice, $calc->lines);
            return $idInvoice;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //factura nueva ya facturada
    public function create($objeto, $manager)
    {
        try {
            $calc = $this->calculateLines($objeto->items);
            $sql = "INSERT INTO invoices
                        (invoice_number, client_id, branch_id, status_id, issued_by, issued_at,
                         subtotal, tax_total, total)
                    VALUES (?, ?, ?, 2, ?, NOW(), ?, ?, ?);";
            $idInvoice = $this->enlace->executeSQL_DML_last($sql, [
                $this->nextNumber(), $objeto->client_id, $manager->branch_id, $manager->id,
                $calc->subtotal, $calc->tax_total, $calc->total,
            ]);
            $this->createItems($idInvoice, $calc->lines);
            return $this->get($idInvoice);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //facturar proforma con las líneas del form
    public function issueProforma($idInvoice, $objeto, $manager)
    {
        try {
            $calc = $this->calculateLines($objeto->items);
            //solo se factura si todavía es proforma
            $sql = "UPDATE invoices
                    SET invoice_number = ?, status_id = 2, issued_by = ?, issued_at = NOW(),
                        subtotal = ?, tax_total = ?, total = ?
                    WHERE id = ? AND status_id = 1;";
            $this->enlace->executeSQL_DML($sql, [
                $this->nextNumber(), $manager->id,
                $calc->subtotal, $calc->tax_total, $calc->total,
                $idInvoice,
            ]);
            //borrar la pila de líneas de la proforma
            $sql = "DELETE FROM invoice_items WHERE invoice_id = ?;";
            $this->enlace->executeSQL_DML($sql, [$idInvoice]);
            $this->createItems($idInvoice, $calc->lines);
            return $this->get($idInvoice);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
