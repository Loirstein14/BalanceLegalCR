<?php
class category
{
    //GET Listado de categorías de productos
    //localhost/appbalancelegalcr/apibalancelegalcr/category
    public function index()
    {
        try {
            $response = new Response();
            $categoryM = new CategoryModel();
            $response->toJSON($categoryM->all());
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
