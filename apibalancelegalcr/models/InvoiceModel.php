<?php
class InvoiceModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Obtener el listado de facturas, de la más reciente a la más antigua
    //Fecha de la factura: fecha de emisión si está en firme, si no la de creación (proforma)
    public function all()
    {
        try {
            $vSql = "SELECT i.id,
                            COALESCE(i.invoice_number, CONCAT('Proforma #', i.id)) AS number,
                            DATE_FORMAT(COALESCE(i.issued_at, i.created_at), '%d/%m/%Y') AS invoice_date,
                            COALESCE(i.issued_at, i.created_at) AS invoice_datetime,
                            CONCAT(u.first_name, ' ', u.last_name) AS client,
                            i.total
                     FROM invoices i, users u
                     WHERE i.client_id = u.id
                     ORDER BY invoice_datetime DESC, i.id DESC;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
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
                       AND i.id = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
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
}
