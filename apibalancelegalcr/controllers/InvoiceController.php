<?php
class invoice
{
    //encargado fijo, el mismo de AppointmentController
    //2 = Adrián Pérez, Oficina Central
    private $idManager = 2;

    //GET historial de facturas de la sucursal del encargado
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function index()
    {
        try {
            $response = new Response();
            //la sucursal sale del encargado
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            $invoiceM = new InvoiceModel();
            $result = $invoiceM->getByBranch($manager->branch_id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET factura por id con el detalle y los totales
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
    //GET encabezado de la factura: encargado, sucursal y % de impuesto
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice/header
    public function header()
    {
        try {
            $response = new Response();
            $userM = new UserModel();
            $invoiceM = new InvoiceModel();
            $result = $userM->getManager($this->idManager);
            if (!empty($result)) {
                //el impuesto lo ocupa react para los totales en tiempo real
                $result->tax_rate = $invoiceM->getTaxRate();
            }
            $response->toJSON($result, "No se encontró el encargado");
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST crear factura, queda facturada con su número
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            //la sucursal y el que emite salen del encargado
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            //las líneas en 0 se quitan (lo pide el enunciado)
            $inputJSON->items = $this->quitarCantidadCero($inputJSON);
            //si alguna regla falla se le devuelve el mensaje
            $mensaje = $this->validar($inputJSON, $manager);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            $invoiceM = new InvoiceModel();
            $result = $invoiceM->create($inputJSON, $manager);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //PUT facturar una proforma, el id viene en el objeto
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            $invoiceM = new InvoiceModel();
            //tiene que existir, seguir siendo proforma y ser de la sucursal del encargado
            $proforma = empty($inputJSON->id) ? null : $invoiceM->get($inputJSON->id);
            if (empty($proforma) || $proforma->status_id != 1 || $proforma->branch_id != $manager->branch_id) {
                $response->toJSON(null, "La factura no existe, ya fue facturada o no es de su sucursal");
                return;
            }
            //el cliente es el de la proforma (viene de la reserva), no se cambia
            $inputJSON->client_id = $proforma->client_id;
            //las líneas en 0 se quitan
            $inputJSON->items = $this->quitarCantidadCero($inputJSON);
            //mismas reglas que una factura nueva
            $mensaje = $this->validar($inputJSON, $manager);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            $result = $invoiceM->issueProforma($proforma->id, $inputJSON, $manager);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //devuelve solo las líneas que no están en 0
    private function quitarCantidadCero($objeto)
    {
        $items = [];
        if (isset($objeto->items) && is_array($objeto->items)) {
            foreach ($objeto->items as $item) {
                if (!isset($item->quantity) || $item->quantity != 0) {
                    $items[] = $item;
                }
            }
        }
        return $items;
    }
    //reglas de la factura, devuelve el mensaje del error o null si todo bien
    private function validar($objeto, $manager)
    {
        $userM = new UserModel();
        $productM = new ProductModel();
        $serviceM = new ServiceModel();
        if (empty($objeto->client_id) || empty($userM->getCustomer($objeto->client_id))) {
            return "Seleccione un cliente válido";
        }
        if (count($objeto->items) == 0) {
            return "La factura debe tener al menos un producto o servicio";
        }
        //productos activos y servicios de la sucursal
        //ojo: si no hay filas executeSQL devuelve null, por eso el ?: []
        $products = $productM->all() ?: [];
        $services = $serviceM->getByBranch($manager->branch_id) ?: [];
        $usados = []; //para no repetir el mismo producto o servicio
        foreach ($objeto->items as $item) {
            $esProducto = !empty($item->product_id);
            $esServicio = !empty($item->service_id);
            //cada línea es un producto o un servicio, no los dos
            if ($esProducto == $esServicio) {
                return "Cada línea debe tener un producto o un servicio";
            }
            //cantidad entera de 1 a 999
            if (!isset($item->quantity) || !ctype_digit((string) $item->quantity)
                || $item->quantity < 1 || $item->quantity > 999) {
                return "La cantidad debe ser un número entero entre 1 y 999";
            }
            //que exista y se pueda vender
            $existe = false;
            foreach ($esProducto ? $products : $services as $row) {
                if ($row->id == ($esProducto ? $item->product_id : $item->service_id)) {
                    $existe = true;
                }
            }
            if (!$existe) {
                return $esProducto
                    ? "Uno de los productos no existe o no está activo"
                    : "Uno de los servicios no existe o no se ofrece en esta sucursal";
            }
            //sin repetidos, si ocupa más le sube la cantidad
            $clave = ($esProducto ? 'P' : 'S') . ($esProducto ? $item->product_id : $item->service_id);
            if (in_array($clave, $usados)) {
                return "Hay un producto o servicio repetido; aumente la cantidad en una sola línea";
            }
            $usados[] = $clave;
        }
        return null;
    }
}
