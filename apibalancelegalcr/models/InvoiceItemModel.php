<?php
class InvoiceItemModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Obtener las líneas de detalle de una factura
    public function getByInvoice($idInvoice)
    {
        try {
            $vSql = "SELECT it.id, it.description, it.quantity, it.unit_price, it.line_subtotal,
                            CASE WHEN it.service_id IS NOT NULL THEN 'Servicio' ELSE 'Producto' END AS item_type
                     FROM invoice_items it
                     WHERE it.invoice_id = $idInvoice
                     ORDER BY it.id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
