<?php
//localhost/appbalancelegalcr/apibalancelegalcr/service
class service
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $serviceM = new ServiceModel();
            //Acción del modelo a ejecutar
            $result = $serviceM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Obtener
    //localhost/appbalancelegalcr/apibalancelegalcr/service/1
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
    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $serviceM = new ServiceModel();
            //El nombre no se puede repetir (en la BD es UNIQUE)
            if ($serviceM->nameExists($inputJSON->name)) {
                $response->toJSON(null, "Ya existe un servicio con ese nombre");
                return;
            }
            //Acción del modelo a ejecutar
            $result = $serviceM->create($inputJSON);
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
            $serviceM = new ServiceModel();
            //El nombre no se puede repetir con el de otro servicio
            if ($serviceM->nameExists($inputJSON->name, $inputJSON->id)) {
                $response->toJSON(null, "Ya existe un servicio con ese nombre");
                return;
            }
            //Acción del modelo a ejecutar
            $result = $serviceM->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
