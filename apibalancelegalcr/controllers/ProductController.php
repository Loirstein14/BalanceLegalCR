<?php
//localhost/appbalancelegalcr/apibalancelegalcr/product
class product
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $productM = new ProductModel();
            //Acción del modelo a ejecutar
            $result = $productM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Obtener
    //localhost/appbalancelegalcr/apibalancelegalcr/product/1
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
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $productM = new ProductModel();
            //El nombre no se puede repetir (en la BD es UNIQUE)
            if ($productM->nameExists($inputJSON->name)) {
                $response->toJSON(null, "Ya existe un producto con ese nombre");
                return;
            }
            //Acción del modelo a ejecutar
            $result = $productM->create($inputJSON);
            //Dar respuesta
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
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $productM = new ProductModel();
            //El nombre no se puede repetir con el de otro producto
            if ($productM->nameExists($inputJSON->name, $inputJSON->id)) {
                $response->toJSON(null, "Ya existe un producto con ese nombre");
                return;
            }
            //Acción del modelo a ejecutar
            $result = $productM->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
