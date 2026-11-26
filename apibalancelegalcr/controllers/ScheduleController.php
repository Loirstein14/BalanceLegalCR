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
    //GET horarios de una sucursal
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
    //POST crear horarios por rango de fechas
    //llega: branch_id, start_date, end_date, weekdays (1 lunes ... 7 domingo), start_time, end_time
    //se crea un horario por cada día del rango que caiga en los días marcados
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $scheduleM = new ScheduleModel();
            //revisar el rango: fechas, días y máximo 3 meses
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
            //todo o nada: primero se revisan todas las fechas, si una falla no se guarda ninguna
            $errores = [];
            foreach ($dates as $date) {
                $inputJSON->schedule_date = $date;
                $mensaje = $this->validar($inputJSON);
                if ($mensaje) {
                    $errores[] = date('d/m/Y', strtotime($date)) . ": " . $mensaje;
                }
            }
            if (count($errores) > 0) {
                //solo se muestran 3 fechas para que el mensaje no quede enorme
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
    //reglas del horario, devuelve el mensaje del error o null si todo bien
    private function validar($objeto, $idSchedule = 0)
    {
        $scheduleM = new ScheduleModel();
        if ($scheduleM->isPastDate($objeto->schedule_date)) {
            return "La fecha no puede ser anterior a hoy";
        }
        //"08:00" < "17:00" se puede comparar como texto
        if ($objeto->end_time <= $objeto->start_time) {
            return "La hora final debe ser mayor a la hora inicial";
        }
        //no se puede montar encima de otro horario de la sucursal ese día
        $choque = $scheduleM->getOverlap($objeto->branch_id, $objeto->schedule_date, $objeto->start_time, $objeto->end_time, $idSchedule);
        if ($choque) {
            return "Se traslapa con el horario de $choque->start_time a $choque->end_time que ya tiene la sucursal ese día";
        }
        //el horario sí puede tener bloqueos adentro (ej el almuerzo)
        //las horas libres de las reservas ya restan esos bloqueos
        return null;
    }
}
