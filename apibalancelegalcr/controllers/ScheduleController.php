<?php
//localhost/appbalancelegalcr/apibalancelegalcr/schedule
class schedule
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            $scheduleM = new ScheduleModel();
            $result = $scheduleM->all();
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
            $scheduleM = new ScheduleModel();
            $result = $scheduleM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET horarios de una sucursal
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
    //POST crea un horario por cada día del rango
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $scheduleM = new ScheduleModel();
            //revisar fechas días y máximo 3 meses
            $mensaje = $scheduleM->checkRange($inputJSON);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            $dates = $scheduleM->datesInRange($inputJSON->start_date, $inputJSON->end_date, $inputJSON->weekdays);
            if (count($dates) == 0) {
                $response->toJSON(null, "Ninguna fecha del rango cae en los días de la semana seleccionados");
                return;
            }
            //si una fecha falla no se guarda ninguna
            $errores = [];
            foreach ($dates as $date) {
                $inputJSON->schedule_date = $date;
                $mensaje = $this->validar($inputJSON);
                if ($mensaje) {
                    $errores[] = date('d/m/Y', strtotime($date)) . ": " . $mensaje;
                }
            }
            if (count($errores) > 0) {
                //solo se enseñan 3 fechas en el mensaje
                $response->toJSON(null, "No se guardó ningún horario. Revise estas fechas: "
                    . implode(" | ", array_slice($errores, 0, 3))
                    . (count($errores) > 3 ? " | y " . (count($errores) - 3) . " más" : ""));
                return;
            }
            $result = [];
            foreach ($dates as $date) {
                $inputJSON->schedule_date = $date;
                $result[] = $scheduleM->create($inputJSON);
            }
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
            //se valida sin chocar consigo mismo
            $mensaje = $this->validar($inputJSON, $inputJSON->id);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            $scheduleM = new ScheduleModel();
            $result = $scheduleM->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //reglas del horario devuelve el error o null
    private function validar($objeto, $idSchedule = 0)
    {
        $scheduleM = new ScheduleModel();
        if ($scheduleM->isPastDate($objeto->schedule_date)) {
            return "La fecha no puede ser anterior a hoy";
        }
        //las horas se pueden comparar como texto
        if ($objeto->end_time <= $objeto->start_time) {
            return "La hora final debe ser mayor a la hora inicial";
        }
        //no puede chocar con otro horario ese día
        $choque = $scheduleM->getOverlap($objeto->branch_id, $objeto->schedule_date, $objeto->start_time, $objeto->end_time, $idSchedule);
        if ($choque) {
            return "Se traslapa con el horario de $choque->start_time a $choque->end_time que ya tiene la sucursal ese día";
        }
        //el horario sí puede tener bloqueos adentro
        return null;
    }
}
