<?php
//localhost/appbalancelegalcr/apibalancelegalcr/category
class category
{
    //GET listar categorías de productos
    public function index()
    {
        try {
            $response = new Response();
            $categoryM = new CategoryModel();
            $result = $categoryM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
