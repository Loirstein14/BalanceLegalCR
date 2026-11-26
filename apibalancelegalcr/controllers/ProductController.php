<?php
//localhost/appbalancelegalcr/apibalancelegalcr/product
class product
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            $productM = new ProductModel();
            $result = $productM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET obtener
    public function get($id)
    {
        try {
            $response = new Response();
            $productM = new ProductModel();
            $result = $productM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $productM = new ProductModel();
            //el nombre no se puede repetir
            if ($productM->nameExists($inputJSON->name)) {
                $response->toJSON(null, "Ya existe un producto con ese nombre");
                return;
            }
            $result = $productM->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //PUT actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $productM = new ProductModel();
            //el nombre no se puede repetir con otro producto
            if ($productM->nameExists($inputJSON->name, $inputJSON->id)) {
                $response->toJSON(null, "Ya existe un producto con ese nombre");
                return;
            }
            $result = $productM->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
