<?php
//localhost/appbalancelegalcr/apibalancelegalcr/block
class block
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            $blockM = new BlockModel();
            $result = $blockM->all();
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
            $blockM = new BlockModel();
            $result = $blockM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET bloqueos de una sucursal
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
    //POST crea un bloqueo por cada día del rango
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $scheduleM = new ScheduleModel();
            //revisar el rango igual que en horarios
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
                $inputJSON->block_date = $date;
                $mensaje = $this->validar($inputJSON);
                if ($mensaje) {
                    $errores[] = date('d/m/Y', strtotime($date)) . ": " . $mensaje;
                }
            }
            if (count($errores) > 0) {
                //solo se enseñan 3 fechas en el mensaje
                $response->toJSON(null, "No se guardó ningún bloqueo. Revise estas fechas: "
                    . implode(" | ", array_slice($errores, 0, 3))
                    . (count($errores) > 3 ? " | y " . (count($errores) - 3) . " más" : ""));
                return;
            }
            //por ahora lo crea el admin hasta que haya login
            $inputJSON->created_by = 1;
            $blockM = new BlockModel();
            $result = [];
            foreach ($dates as $date) {
                $inputJSON->block_date = $date;
                $result[] = $blockM->create($inputJSON);
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
            $blockM = new BlockModel();
            $result = $blockM->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //reglas del bloqueo devuelve el error o null
    private function validar($objeto, $idBlock = 0)
    {
        $scheduleM = new ScheduleModel();
        $blockM = new BlockModel();
        if ($scheduleM->isPastDate($objeto->block_date)) {
            return "La fecha no puede ser anterior a hoy";
        }
        if ($objeto->end_time <= $objeto->start_time) {
            return "La hora final debe ser mayor a la hora inicial";
        }
        //no puede chocar con otro bloqueo ese día
        $choque = $blockM->getOverlap($objeto->branch_id, $objeto->block_date, $objeto->start_time, $objeto->end_time, $idBlock);
        if ($choque) {
            return "Se traslapa con el bloqueo de $choque->start_time a $choque->end_time que ya tiene la sucursal ese día";
        }
        //el bloqueo sí puede caer dentro del horario
        return null;
    }
}
