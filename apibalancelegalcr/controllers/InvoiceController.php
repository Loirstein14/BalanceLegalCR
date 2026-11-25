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
    //GET Datos del encabezado de la factura: encargado, su sucursal y el % de impuesto
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice/header
    public function header()
    {
        try {
            $response = new Response();
            $userM = new UserModel();
            $invoiceM = new InvoiceModel();
            $result = $userM->getManager($this->idManager);
            if (!empty($result)) {
                //El impuesto se ocupa en React para calcular los totales en tiempo real
                $result->tax_rate = $invoiceM->getTaxRate();
            }
            $response->toJSON($result, "No se encontró el encargado");
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST Crear factura (queda Facturada, con su número)
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //La sucursal y el encargado que emite la factura salen del encargado fijo
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            //Las líneas con cantidad 0 se eliminan (así lo pide el enunciado)
            $inputJSON->items = $this->quitarCantidadCero($inputJSON);
            //Revisar las reglas del negocio; si algo falla se le responde el mensaje al usuario
            $mensaje = $this->validar($inputJSON, $manager);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            //Instancia del modelo
            $invoiceM = new InvoiceModel();
            //Acción del modelo a ejecutar
            $result = $invoiceM->create($inputJSON, $manager);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //PUT Facturar una proforma (el id va dentro del objeto)
    //localhost/appbalancelegalcr/apibalancelegalcr/invoice
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            $invoiceM = new InvoiceModel();
            //La factura tiene que existir, seguir siendo proforma y ser de la sucursal del encargado
            $proforma = empty($inputJSON->id) ? null : $invoiceM->get($inputJSON->id);
            if (empty($proforma) || $proforma->status_id != 1 || $proforma->branch_id != $manager->branch_id) {
                $response->toJSON(null, "La factura no existe, ya fue facturada o no es de su sucursal");
                return;
            }
            //El cliente es el de la proforma (viene de la reserva), no se cambia
            $inputJSON->client_id = $proforma->client_id;
            //Las líneas con cantidad 0 se eliminan
            $inputJSON->items = $this->quitarCantidadCero($inputJSON);
            //Mismas reglas que una factura nueva
            $mensaje = $this->validar($inputJSON, $manager);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            //Acción del modelo a ejecutar
            $result = $invoiceM->issueProforma($proforma->id, $inputJSON, $manager);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Devuelve las líneas que no tienen cantidad 0
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
    //Reglas de la factura. Devuelve el mensaje del error, o null si todo está bien
    private function validar($objeto, $manager)
    {
        $userM = new UserModel();
        $productM = new ProductModel();
        $serviceM = new ServiceModel();
        //El cliente tiene que existir, estar activo y tener rol Cliente
        if (empty($objeto->client_id) || empty($userM->getCustomer($objeto->client_id))) {
            return "Seleccione un cliente válido";
        }
        //Al menos una línea
        if (count($objeto->items) == 0) {
            return "La factura debe tener al menos un producto o servicio";
        }
        //Productos activos y servicios que ofrece la sucursal
        //(si no hay filas, executeSQL devuelve null; se cambia por un arreglo vacío)
        $products = $productM->all() ?: [];
        $services = $serviceM->getByBranch($manager->branch_id) ?: [];
        $usados = []; //Para no repetir el mismo producto o servicio en dos líneas
        foreach ($objeto->items as $item) {
            $esProducto = !empty($item->product_id);
            $esServicio = !empty($item->service_id);
            //Cada línea es un producto O un servicio
            if ($esProducto == $esServicio) {
                return "Cada línea debe tener un producto o un servicio";
            }
            //Cantidad: número entero entre 1 y 999
            if (!isset($item->quantity) || !ctype_digit((string) $item->quantity)
                || $item->quantity < 1 || $item->quantity > 999) {
                return "La cantidad debe ser un número entero entre 1 y 999";
            }
            //Que exista y se pueda vender
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
            //Sin repetidos (si se ocupa más, se aumenta la cantidad)
            $clave = ($esProducto ? 'P' : 'S') . ($esProducto ? $item->product_id : $item->service_id);
            if (in_array($clave, $usados)) {
                return "Hay un producto o servicio repetido; aumente la cantidad en una sola línea";
            }
            $usados[] = $clave;
        }
        return null;
    }
}
