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
    //POST Crear bloqueos por rango de fechas
    //Recibe: branch_id, start_date, end_date, weekdays (1 = lunes ... 7 = domingo), start_time, end_time, reason
    //Se crea un bloqueo por cada día del rango que caiga en los días escogidos
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            $scheduleM = new ScheduleModel();
            //Revisar el rango (mismas reglas que los horarios)
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
                $inputJSON->block_date = $date;
                $mensaje = $this->validar($inputJSON);
                if ($mensaje) {
                    $errores[] = date('d/m/Y', strtotime($date)) . ": " . $mensaje;
                }
            }
            if (count($errores) > 0) {
                //Se muestran máximo 3 fechas para que el mensaje no sea enorme
                $response->toJSON(null, "No se guardó ningún bloqueo. Revise estas fechas: "
                    . implode(" | ", array_slice($errores, 0, 3))
                    . (count($errores) > 3 ? " | y " . (count($errores) - 3) . " más" : ""));
                return;
            }
            //Quién creó el bloqueo: por ahora fijo el administrador (id 1),
            //cuando esté el login se toma del usuario que inició sesión
            $inputJSON->created_by = 1;
            //Crear un bloqueo por fecha
            $blockM = new BlockModel();
            $result = [];
            foreach ($dates as $date) {
                $inputJSON->block_date = $date;
                $result[] = $blockM->create($inputJSON);
            }
            //Dar respuesta: la lista de bloqueos creados
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
        //Un bloqueo SÍ puede caer dentro del horario (por ejemplo el almuerzo de 12:00 a 13:00):
        //para eso sirve, cierra esas horas y las horas disponibles de las reservas ya lo restan
        return null;
    }
}
