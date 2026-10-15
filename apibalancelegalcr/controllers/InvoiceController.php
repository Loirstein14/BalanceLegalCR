<?php
class invoice
{
    //GET Listado de facturas
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function index()
    {
        try {
            $response = new Response();
            $invoiceM = new InvoiceModel();
            $result = $invoiceM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Factura por id (encabezado, detalle y totales)
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice/1
    public function get($id)
    {
        try {
            $response = new Response();
            $invoiceM = new InvoiceModel();
            $result = $invoiceM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
