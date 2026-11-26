<?php
//localhost/appbalancelegalcr/apibalancelegalcr/branch
class branch
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            $branchM = new BranchModel();
            $result = $branchM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET obtener con sus encargados
    public function get($id)
    {
        try {
            $response = new Response();
            $branchM = new BranchModel();
            $result = $branchM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET encargados que se pueden asignar
    public function managers($idBranch = 0)
    {
        try {
            $response = new Response();
            $branchM = new BranchModel();
            $result = $branchM->availableManagers($idBranch);
            $response->toJSON($result, "No hay encargados disponibles");
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
            $branchM = new BranchModel();
            //el nombre no se puede repetir
            if ($branchM->nameExists($inputJSON->name)) {
                $response->toJSON(null, "Ya existe una sucursal con ese nombre");
                return;
            }
            $result = $branchM->create($inputJSON);
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
            $branchM = new BranchModel();
            //el nombre no se puede repetir con otra sucursal
            if ($branchM->nameExists($inputJSON->name, $inputJSON->id)) {
                $response->toJSON(null, "Ya existe una sucursal con ese nombre");
                return;
            }
            $result = $branchM->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
