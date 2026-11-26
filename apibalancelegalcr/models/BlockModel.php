<?php
//bloqueos de horas de una sucursal por fecha (tabla schedule_blocks)
//provider_id queda en NULL porque el bloqueo es para toda la sucursal
class BlockModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //las horas sin segundos y la fecha en dd/mm/aaaa para mostrarla
    private $campos = "k.id, k.branch_id, b.name AS branch, k.block_date,
                       DATE_FORMAT(k.block_date, '%d/%m/%Y') AS date_text,
                       TIME_FORMAT(k.start_time, '%H:%i') AS start_time,
                       TIME_FORMAT(k.end_time, '%H:%i') AS end_time,
                       k.reason, CONCAT(u.first_name, ' ', u.last_name) AS created_by";
    public function all()
    {
        try {
            $vSql = "SELECT $this->campos
                     FROM schedule_blocks k, branches b, users u
                     WHERE k.branch_id = b.id AND k.created_by = u.id
                     ORDER BY k.block_date, b.name, k.start_time;";
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
                     FROM schedule_blocks k, branches b, users u
                     WHERE k.branch_id = b.id AND k.created_by = u.id AND k.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //bloqueos de una sucursal
    public function getByBranch($idBranch)
    {
        try {
            $vSql = "SELECT $this->campos
                     FROM schedule_blocks k, branches b, users u
                     WHERE k.branch_id = b.id AND k.created_by = u.id AND k.branch_id = ?
                     ORDER BY k.block_date, k.start_time;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //busca un bloqueo de la misma sucursal y fecha que choque con el rango
    //(la misma consulta de ScheduleModel pero en schedule_blocks)
    public function getOverlap($idBranch, $date, $start, $end, $idBlock = 0)
    {
        try {
            $vSql = "SELECT TIME_FORMAT(start_time, '%H:%i') AS start_time,
                            TIME_FORMAT(end_time, '%H:%i') AS end_time, reason
                     FROM schedule_blocks
                     WHERE branch_id = ? AND block_date = ?
                       AND start_time < ? AND end_time > ?
                       AND id <> ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch, $date, $end, $start, $idBlock]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function create($objeto)
    {
        try {
            $sql = "INSERT INTO schedule_blocks (branch_id, block_date, start_time, end_time, reason, created_by)
                    VALUES (?, ?, ?, ?, ?, ?);";
            $idBlock = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->branch_id,
                $objeto->block_date,
                $objeto->start_time,
                $objeto->end_time,
                $objeto->reason,
                $objeto->created_by,
            ]);
            return $this->get($idBlock);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //el id viene dentro del objeto
    public function update($objeto)
    {
        try {
            $sql = "UPDATE schedule_blocks
                    SET branch_id = ?, block_date = ?, start_time = ?, end_time = ?, reason = ?
                    WHERE id = ?;";
            $cResults = $this->enlace->executeSQL_DML($sql, [
                $objeto->branch_id,
                $objeto->block_date,
                $objeto->start_time,
                $objeto->end_time,
                $objeto->reason,
                $objeto->id,
            ]);
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
