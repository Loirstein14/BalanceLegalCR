<?php
//Horarios de atención de cada sucursal por fecha (tabla branch_schedules).
//Las horas se manejan en horas completas (08:00, 09:00...) como dijo el profe.
class ScheduleModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Campos que se devuelven: las horas sin segundos y la fecha en formato dd/mm/aaaa para mostrarla
    private $campos = "s.id, s.branch_id, b.name AS branch, s.schedule_date,
                       DATE_FORMAT(s.schedule_date, '%d/%m/%Y') AS date_text,
                       TIME_FORMAT(s.start_time, '%H:%i') AS start_time,
                       TIME_FORMAT(s.end_time, '%H:%i') AS end_time";
    //Obtener el listado de horarios (los de hoy en adelante primero)
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
    //Obtener un horario por su id
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
    //Obtener los horarios de una sucursal
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
    //Buscar un horario de la misma sucursal y fecha que se traslape con el rango.
    //Dos rangos se traslapan si uno empieza antes de que el otro termine y termina después de que el otro empieza.
    //$idSchedule: al modificar, para que no se compare consigo mismo
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
    //Revisar si una fecha ya pasó (se le pregunta a MySQL para usar la fecha del servidor de la BD)
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
    //Crear horario
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
            //Retornar horario
            return $this->get($idSchedule);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Actualizar horario (el id viene dentro del objeto)
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
            //Retornar horario
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
