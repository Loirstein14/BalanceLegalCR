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
    //POST Crear horarios por rango de fechas
    //Recibe: branch_id, start_date, end_date, weekdays (1 = lunes ... 7 = domingo), start_time, end_time
    //Se crea un horario por cada día del rango que caiga en los días escogidos
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            $scheduleM = new ScheduleModel();
            //Revisar el rango (fechas, días de la semana y máximo de días)
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
            //Todo o nada: primero se revisan TODAS las fechas; si alguna falla no se guarda ninguna
            $errores = [];
            foreach ($dates as $date) {
                $inputJSON->schedule_date = $date;
                $mensaje = $this->validar($inputJSON);
                if ($mensaje) {
                    $errores[] = date('d/m/Y', strtotime($date)) . ": " . $mensaje;
                }
            }
            if (count($errores) > 0) {
                //Se muestran máximo 3 fechas para que el mensaje no sea enorme
                $response->toJSON(null, "No se guardó ningún horario. Revise estas fechas: "
                    . implode(" | ", array_slice($errores, 0, 3))
                    . (count($errores) > 3 ? " | y " . (count($errores) - 3) . " más" : ""));
                return;
            }
            //Crear un horario por fecha
            $result = [];
            foreach ($dates as $date) {
                $inputJSON->schedule_date = $date;
                $result[] = $scheduleM->create($inputJSON);
            }
            //Dar respuesta: la lista de horarios creados
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
        //Un horario SÍ puede tener bloqueos adentro (por ejemplo el almuerzo):
        //el bloqueo cierra esas horas y las horas disponibles de las reservas ya lo restan
        return null;
    }
}
