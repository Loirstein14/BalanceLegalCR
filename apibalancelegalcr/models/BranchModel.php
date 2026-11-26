<?php
//los encargados son users con role_id = 2
//un encargado es de una sola sucursal, se guarda en users.branch_id
class BranchModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //sucursales con la cantidad de encargados para la tabla
    public function all()
    {
        try {
            $vSql = "SELECT b.id, b.name, b.phone, b.email, b.is_active,
                            COUNT(u.id) AS managers_count
                     FROM branches b
                     LEFT JOIN users u ON u.branch_id = b.id AND u.role_id = 2
                     GROUP BY b.id
                     ORDER BY b.name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //sucursal por id con sus encargados
    public function get($id)
    {
        try {
            $vSql = "SELECT id, name, description, address, phone, email, is_active
                     FROM branches WHERE id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                $vResultado->managers = $this->getManagersBranch($id);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //encargados de una sucursal
    public function getManagersBranch($idBranch)
    {
        try {
            $vSql = "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email
                     FROM users
                     WHERE branch_id = ? AND role_id = 2
                     ORDER BY first_name, last_name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            //si no tiene encargados va la lista vacía
            return $vResultado ?? [];
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //encargados que se pueden escoger: los que no tienen sucursal
    //y si se está editando, también los que ya son de esa sucursal
    public function availableManagers($idBranch = 0)
    {
        try {
            $vSql = "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email
                     FROM users
                     WHERE role_id = 2 AND is_active = 1
                       AND (branch_id IS NULL OR branch_id = ?)
                     ORDER BY first_name, last_name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //ver si ya hay otra sucursal con ese nombre (al editar no se compara con ella misma)
    public function nameExists($name, $idBranch = 0)
    {
        try {
            $vSql = "SELECT id FROM branches WHERE name = ? AND id <> ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$name, $idBranch]);
            return !empty($vResultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function create($objeto)
    {
        try {
            $sql = "INSERT INTO branches (name, description, address, phone, email)
                    VALUES (?, ?, ?, ?, ?);";
            $idBranch = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->name,
                $objeto->description,
                $objeto->address,
                $objeto->phone,
                $objeto->email,
            ]);
            //encargados: a cada uno se le pone el id de la sucursal
            //solo si sigue sin sucursal, para no quitárselo a otra
            foreach ($objeto->managers as $idManager) {
                $sql = "UPDATE users SET branch_id = ?
                        WHERE id = ? AND role_id = 2 AND branch_id IS NULL;";
                $vResultadoM = $this->enlace->executeSQL_DML($sql, [$idBranch, $idManager]);
            }
            return $this->get($idBranch);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //el id viene dentro del objeto
    public function update($objeto)
    {
        try {
            $sql = "UPDATE branches
                    SET name = ?, description = ?, address = ?, phone = ?, email = ?
                    WHERE id = ?;";
            $cResults = $this->enlace->executeSQL_DML($sql, [
                $objeto->name,
                $objeto->description,
                $objeto->address,
                $objeto->phone,
                $objeto->email,
                $objeto->id,
            ]);
            //encargados: igual que los géneros de las películas, primero se sueltan
            //los que tenía y luego se asignan los que vienen del form
            $sql = "UPDATE users SET branch_id = NULL WHERE branch_id = ? AND role_id = 2;";
            $vResultadoD = $this->enlace->executeSQL_DML($sql, [$objeto->id]);
            foreach ($objeto->managers as $idManager) {
                $sql = "UPDATE users SET branch_id = ?
                        WHERE id = ? AND role_id = 2 AND branch_id IS NULL;";
                $vResultadoM = $this->enlace->executeSQL_DML($sql, [$objeto->id, $idManager]);
            }
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
