<?php
class product
{
    //GET Listado de productos
    //localhost/appbalancelegalcr/apibalancelegalcr/product
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
    //GET Producto por id
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
}