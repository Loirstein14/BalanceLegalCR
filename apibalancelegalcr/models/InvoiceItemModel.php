<?php
class InvoiceItemModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //líneas de una factura
    public function getByInvoice($idInvoice)
    {
        try {
            //product_id y service_id se ocupan para precargar la proforma
            $vSql = "SELECT it.id, it.product_id, it.service_id, it.description, it.quantity,
                            it.unit_price, it.line_subtotal,
                            CASE WHEN it.service_id IS NOT NULL THEN 'Servicio' ELSE 'Producto' END AS item_type
                     FROM invoice_items it
                     WHERE it.invoice_id = ?
                     ORDER BY it.id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idInvoice]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
