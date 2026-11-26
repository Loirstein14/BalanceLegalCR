<?php
//horarios de cada sucursal por fecha
class ScheduleModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //horas sin segundos y fecha en dd/mm/aaaa
    private $campos = "s.id, s.branch_id, b.name AS branch, s.schedule_date,
                       DATE_FORMAT(s.schedule_date, '%d/%m/%Y') AS date_text,
                       TIME_FORMAT(s.start_time, '%H:%i') AS start_time,
                       TIME_FORMAT(s.end_time, '%H:%i') AS end_time";
    //horarios de hoy en adelante primero
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
    //busca un horario que choque ese día
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
    //ver si la fecha ya pasó según MySQL
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
    //reglas del rango de fechas devuelve el error o null
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
        //máximo 3 meses por rango
        $dias = (strtotime($objeto->end_date) - strtotime($objeto->start_date)) / 86400;
        if ($dias > 92) {
            return "El rango puede ser de máximo 3 meses";
        }
        //al menos un día de la semana
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
    public function datesInRange($startDate, $endDate, $weekdays)
    {
        $dates = [];
        $date = new DateTime($startDate);
        $end = new DateTime($endDate);
        while ($date <= $end) {
            //N da el día de la semana de 1 a 7
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
