<?php
//localhost/appbalancelegalcr/apibalancelegalcr/schedule
class schedule
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $scheduleM = new ScheduleModel();
            //Acción del modelo a ejecutar
            $result = $scheduleM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Obtener
    //localhost/appbalancelegalcr/apibalancelegalcr/schedule/1
    public function get($id)
    {
        try {
            $response = new Response();
            $scheduleM = new ScheduleModel();
            $result = $scheduleM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Horarios de una sucursal
    //localhost/appbalancelegalcr/apibalancelegalcr/schedule/getByBranch/1
    public function getByBranch($idBranch)
    {
        try {
            $response = new Response();
            $scheduleM = new ScheduleModel();
            $result = $scheduleM->getByBranch($idBranch);
            $response->toJSON($result, "La sucursal no tiene horarios registrados");
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
            //Instancia del modelo
            $scheduleM = new ScheduleModel();
            //Acción del modelo a ejecutar
            $result = $scheduleM->create($inputJSON);
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
            $scheduleM = new ScheduleModel();
            //Acción del modelo a ejecutar
            $result = $scheduleM->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Reglas del horario. Devuelve el mensaje del error, o null si todo está bien
    private function validar($objeto, $idSchedule = 0)
    {
        $scheduleM = new ScheduleModel();
        $blockM = new BlockModel();
        //La fecha no puede ser anterior a hoy
        if ($scheduleM->isPastDate($objeto->schedule_date)) {
            return "La fecha no puede ser anterior a hoy";
        }
        //La hora final tiene que ser después de la inicial ("08:00" < "17:00" se compara bien como texto)
        if ($objeto->end_time <= $objeto->start_time) {
            return "La hora final debe ser mayor a la hora inicial";
        }
        //Horario contra horario: no se puede traslapar con otro horario de la sucursal ese día
        $choque = $scheduleM->getOverlap($objeto->branch_id, $objeto->schedule_date, $objeto->start_time, $objeto->end_time, $idSchedule);
        if ($choque) {
            return "Se traslapa con el horario de $choque->start_time a $choque->end_time que ya tiene la sucursal ese día";
        }
        //Horario contra bloqueo: tampoco se puede traslapar con un bloqueo de la sucursal ese día
        $choque = $blockM->getOverlap($objeto->branch_id, $objeto->schedule_date, $objeto->start_time, $objeto->end_time);
        if ($choque) {
            return "Se traslapa con el bloqueo de $choque->start_time a $choque->end_time que tiene la sucursal ese día";
        }
        return null;
    }
}
