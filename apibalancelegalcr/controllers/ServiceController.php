<?php
//localhost/appbalancelegalcr/apibalancelegalcr/service
class service
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            $serviceM = new ServiceModel();
            $result = $serviceM->all();
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
            $serviceM = new ServiceModel();
            $result = $serviceM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET servicios que da una sucursal
    public function getByBranch($idBranch)
    {
        try {
            $response = new Response();
            $serviceM = new ServiceModel();
            $result = $serviceM->getByBranch($idBranch);
            $response->toJSON($result, "La sucursal no tiene servicios activos");
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
            $serviceM = new ServiceModel();
            //el nombre no se puede repetir
            if ($serviceM->nameExists($inputJSON->name)) {
                $response->toJSON(null, "Ya existe un servicio con ese nombre");
                return;
            }
            $result = $serviceM->create($inputJSON);
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
            $serviceM = new ServiceModel();
            //el nombre no se puede repetir con otro servicio
            if ($serviceM->nameExists($inputJSON->name, $inputJSON->id)) {
                $response->toJSON(null, "Ya existe un servicio con ese nombre");
                return;
            }
            $result = $serviceM->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
