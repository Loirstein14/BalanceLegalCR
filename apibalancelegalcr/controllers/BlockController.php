<?php
//localhost/appbalancelegalcr/apibalancelegalcr/block
class block
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $blockM = new BlockModel();
            //Acción del modelo a ejecutar
            $result = $blockM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Obtener
    //localhost/appbalancelegalcr/apibalancelegalcr/block/1
    public function get($id)
    {
        try {
            $response = new Response();
            $blockM = new BlockModel();
            $result = $blockM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Bloqueos de una sucursal
    //localhost/appbalancelegalcr/apibalancelegalcr/block/getByBranch/1
    public function getByBranch($idBranch)
    {
        try {
            $response = new Response();
            $blockM = new BlockModel();
            $result = $blockM->getByBranch($idBranch);
            $response->toJSON($result, "La sucursal no tiene bloqueos registrados");
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
            //Revisar las reglas del negocio; si algo falla se le responde el mensaje al usuario
            $mensaje = $this->validar($inputJSON);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            //Quién creó el bloqueo: por ahora fijo el administrador (id 1),
            //cuando esté el login se toma del usuario que inició sesión
            $inputJSON->created_by = 1;
            //Instancia del modelo
            $blockM = new BlockModel();
            //Acción del modelo a ejecutar
            $result = $blockM->create($inputJSON);
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
            //Revisar las reglas del negocio (sin compararlo consigo mismo)
            $mensaje = $this->validar($inputJSON, $inputJSON->id);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            //Instancia del modelo
            $blockM = new BlockModel();
            //Acción del modelo a ejecutar
            $result = $blockM->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Reglas del bloqueo. Devuelve el mensaje del error, o null si todo está bien
    private function validar($objeto, $idBlock = 0)
    {
        $scheduleM = new ScheduleModel();
        $blockM = new BlockModel();
        //La fecha no puede ser anterior a hoy
        if ($scheduleM->isPastDate($objeto->block_date)) {
            return "La fecha no puede ser anterior a hoy";
        }
        //La hora final tiene que ser después de la inicial
        if ($objeto->end_time <= $objeto->start_time) {
            return "La hora final debe ser mayor a la hora inicial";
        }
        //Bloqueo contra bloqueo: no se puede traslapar con otro bloqueo de la sucursal ese día
        $choque = $blockM->getOverlap($objeto->branch_id, $objeto->block_date, $objeto->start_time, $objeto->end_time, $idBlock);
        if ($choque) {
            return "Se traslapa con el bloqueo de $choque->start_time a $choque->end_time que ya tiene la sucursal ese día";
        }
        //Bloqueo contra horario: tampoco se puede traslapar con un horario de la sucursal ese día
        $choque = $scheduleM->getOverlap($objeto->branch_id, $objeto->block_date, $objeto->start_time, $objeto->end_time);
        if ($choque) {
            return "Se traslapa con el horario de $choque->start_time a $choque->end_time que tiene la sucursal ese día";
        }
        return null;
    }
}
