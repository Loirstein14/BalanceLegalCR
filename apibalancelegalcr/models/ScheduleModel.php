<?php
//horarios de cada sucursal por fecha (tabla branch_schedules)
//las horas van en horas completas (08:00, 09:00...) como dijo el profe
class ScheduleModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //las horas sin segundos y la fecha en dd/mm/aaaa para mostrarla
    private $campos = "s.id, s.branch_id, b.name AS branch, s.schedule_date,
                       DATE_FORMAT(s.schedule_date, '%d/%m/%Y') AS date_text,
                       TIME_FORMAT(s.start_time, '%H:%i') AS start_time,
                       TIME_FORMAT(s.end_time, '%H:%i') AS end_time";
    //horarios, los de hoy en adelante primero
    public function all()
    {
        try {
            $vSql = "SELECT $this->campos
                     FROM branch_schedules s, branches b
                     WHERE s.branch_id = b.id
                     ORDER BY s.schedule_date, b.name, s.start_time;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function get($id)
    {
        try {
            $vSql = "SELECT $this->campos
                     FROM branch_schedules s, branches b
                     WHERE s.branch_id = b.id AND s.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //horarios de una sucursal
    public function getByBranch($idBranch)
    {
        try {
            $vSql = "SELECT $this->campos
                     FROM branch_schedules s, branches b
                     WHERE s.branch_id = b.id AND s.branch_id = ?
                     ORDER BY s.schedule_date, s.start_time;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //busca un horario de la misma sucursal y fecha que choque con el rango
    //chocan si uno empieza antes de que el otro termine y termina después de que el otro empieza
    //$idSchedule es para que al editar no choque consigo mismo
    public function getOverlap($idBranch, $date, $start, $end, $idSchedule = 0)
    {
        try {
            $vSql = "SELECT TIME_FORMAT(start_time, '%H:%i') AS start_time,
                            TIME_FORMAT(end_time, '%H:%i') AS end_time
                     FROM branch_schedules
                     WHERE branch_id = ? AND schedule_date = ?
                       AND start_time < ? AND end_time > ?
                       AND id <> ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch, $date, $end, $start, $idSchedule]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //ver si una fecha ya pasó, se le pregunta a MySQL para usar la fecha de la BD
    public function isPastDate($date)
    {
        try {
            $vSql = "SELECT ? < CURDATE() AS past;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$date]);
            return $vResultado[0]->past == 1;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //reglas del rango de fechas (lo usan horarios y bloqueos)
    //devuelve el mensaje del error o null si todo bien
    public function checkRange($objeto)
    {
        if (empty($objeto->start_date) || empty($objeto->end_date)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $objeto->start_date)
            || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $objeto->end_date)) {
            return "La fecha inicial y la fecha final son requeridas";
        }
        if ($this->isPastDate($objeto->start_date)) {
            return "La fecha inicial no puede ser anterior a hoy";
        }
        if ($objeto->end_date < $objeto->start_date) {
            return "La fecha final debe ser igual o posterior a la fecha inicial";
        }
        //máximo 3 meses por rango, para no crear cientos de registros por error
        $dias = (strtotime($objeto->end_date) - strtotime($objeto->start_date)) / 86400;
        if ($dias > 92) {
            return "El rango puede ser de máximo 3 meses";
        }
        //al menos un día, del 1 (lunes) al 7 (domingo)
        if (empty($objeto->weekdays) || !is_array($objeto->weekdays)) {
            return "Seleccione al menos un día de la semana";
        }
        foreach ($objeto->weekdays as $day) {
            if (!in_array($day, [1, 2, 3, 4, 5, 6, 7])) {
                return "Día de la semana no válido";
            }
        }
        return null;
    }
    //fechas del rango que caen en los días marcados
    //$weekdays va con la numeración ISO: 1 lunes ... 7 domingo
    //ej: del 2026-11-30 al 2026-12-06 con [1,2,3,4,5] da lunes 30 a viernes 4
    public function datesInRange($startDate, $endDate, $weekdays)
    {
        $dates = [];
        $date = new DateTime($startDate);
        $end = new DateTime($endDate);
        while ($date <= $end) {
            //format('N') da el día de la semana: 1 (lunes) a 7 (domingo)
            if (in_array((int) $date->format('N'), $weekdays)) {
                $dates[] = $date->format('Y-m-d');
            }
            $date->modify('+1 day');
        }
        return $dates;
    }
    public function create($objeto)
    {
        try {
            $sql = "INSERT INTO branch_schedules (branch_id, schedule_date, start_time, end_time)
                    VALUES (?, ?, ?, ?);";
            $idSchedule = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->branch_id,
                $objeto->schedule_date,
                $objeto->start_time,
                $objeto->end_time,
            ]);
            return $this->get($idSchedule);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //el id viene dentro del objeto
    public function update($objeto)
    {
        try {
            $sql = "UPDATE branch_schedules
                    SET branch_id = ?, schedule_date = ?, start_time = ?, end_time = ?
                    WHERE id = ?;";
            $cResults = $this->enlace->executeSQL_DML($sql, [
                $objeto->branch_id,
                $objeto->schedule_date,
                $objeto->start_time,
                $objeto->end_time,
                $objeto->id,
            ]);
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
