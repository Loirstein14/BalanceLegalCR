<?php
//localhost/appbalancelegalcr/apibalancelegalcr/branch
class branch
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $branchM = new BranchModel();
            //Acción del modelo a ejecutar
            $result = $branchM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Obtener (con sus encargados)
    //localhost/appbalancelegalcr/apibalancelegalcr/branch/1
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
    //GET Encargados que se pueden asignar
    //localhost/appbalancelegalcr/apibalancelegalcr/branch/managers      (al crear: solo los libres)
    //localhost/appbalancelegalcr/apibalancelegalcr/branch/managers/1    (al modificar la sucursal 1)
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
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $branchM = new BranchModel();
            //El nombre no se puede repetir (en la BD es UNIQUE)
            if ($branchM->nameExists($inputJSON->name)) {
                $response->toJSON(null, "Ya existe una sucursal con ese nombre");
                return;
            }
            //Acción del modelo a ejecutar
            $result = $branchM->create($inputJSON);
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
            $branchM = new BranchModel();
            //El nombre no se puede repetir con el de otra sucursal
            if ($branchM->nameExists($inputJSON->name, $inputJSON->id)) {
                $response->toJSON(null, "Ya existe una sucursal con ese nombre");
                return;
            }
            //Acción del modelo a ejecutar
            $result = $branchM->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
