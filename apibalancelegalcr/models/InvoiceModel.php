<?php
class InvoiceModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Facturas de una sucursal (la del encargado), de la más reciente a la más antigua
    //Fecha de la factura: fecha de emisión si ya está facturada, si no la de creación (proforma)
    //status_id, client_id e invoice_datetime se ocupan en React para el estado y los filtros
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
    //Obtener una factura por su id: encabezado, líneas de detalle y totales
    public function get($id)
    {
        try {
            $itemM = new InvoiceItemModel(); //Instanciar el modelo de líneas de factura
            $vSql = "SELECT i.id,
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
                $vResultado = $vResultado[0]; //Encabezado de la factura
                //Líneas de detalle --items
                $vResultado->items = $itemM->getByInvoice($vResultado->id);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Porcentaje de impuesto del negocio (business_settings, 13 %)
    public function getTaxRate()
    {
        try {
            $vSql = "SELECT tax_rate FROM business_settings WHERE id = 1;";
            return $this->enlace->ExecuteSQL($vSql)[0]->tax_rate;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Siguiente número de factura: FAC-0001, FAC-0002, ...
    //Toma el número más alto que ya existe (lo que va después de 'FAC-') y le suma 1
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
    //Calcular las líneas y los totales con los precios de la BD (no con lo que mande React)
    //$items: [{product_id o service_id, quantity}]
    //Cada línea: subtotal = precio x cantidad, impuesto = subtotal x 13 %, total = subtotal + impuesto
    //Totales de la factura = suma de las líneas
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
                //Producto o servicio: de ahí salen el nombre y el precio de este momento
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
    //Guardar las líneas de una factura (se copia el nombre, el precio y el impuesto de este momento)
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
    //Crear la factura proforma de una reserva: una línea con el servicio, cantidad 1
    //invoice_number, issued_by e issued_at quedan en NULL hasta que se facture
    public function createProforma($idAppointment, $idClient, $idBranch, $service)
    {
        try {
            //Misma forma de calcular que una factura normal
            $calc = $this->calculateLines([(object) ['service_id' => $service->id, 'quantity' => 1]]);
            //Encabezado: estado 1 = Proforma
            $sql = "INSERT INTO invoices (appointment_id, client_id, branch_id, status_id, subtotal, tax_total, total)
                    VALUES (?, ?, ?, 1, ?, ?, ?);";
            $idInvoice = $this->enlace->executeSQL_DML_last($sql, [
                $idAppointment, $idClient, $idBranch, $calc->subtotal, $calc->tax_total, $calc->total,
            ]);
            //Línea del servicio
            $this->createItems($idInvoice, $calc->lines);
            return $idInvoice;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Crear factura ya facturada (estado 2), con su número, quién la emitió y la fecha de hoy
    //$manager trae la sucursal y el id del encargado que la emite
    public function create($objeto, $manager)
    {
        try {
            //Líneas y totales calculados con los precios de la BD
            $calc = $this->calculateLines($objeto->items);
            //Encabezado
            $sql = "INSERT INTO invoices
                        (invoice_number, client_id, branch_id, status_id, issued_by, issued_at,
                         subtotal, tax_total, total)
                    VALUES (?, ?, ?, 2, ?, NOW(), ?, ?, ?);";
            $idInvoice = $this->enlace->executeSQL_DML_last($sql, [
                $this->nextNumber(), $objeto->client_id, $manager->branch_id, $manager->id,
                $calc->subtotal, $calc->tax_total, $calc->total,
            ]);
            //Líneas de detalle
            $this->createItems($idInvoice, $calc->lines);
            //Retornar la factura creada
            return $this->get($idInvoice);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
