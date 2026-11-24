<?php
class invoice
{
    //Encargado fijo establecido en el controlador (el mismo de las reservas)
    //Usuario 2: Adrián Pérez, encargado de la Oficina Central
    private $idManager = 2;

    //GET Historial de facturas de la sucursal del encargado
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function index()
    {
        try {
            $response = new Response();
            //La sucursal sale del encargado
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            $invoiceM = new InvoiceModel();
            $result = $invoiceM->getByBranch($manager->branch_id);
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
