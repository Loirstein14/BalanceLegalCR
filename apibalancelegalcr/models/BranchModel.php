<?php
//Los encargados son usuarios con role_id = 2 (Encargado en la tabla roles).
//Un encargado pertenece a una sola sucursal: eso se guarda en users.branch_id
class BranchModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Todas las sucursales con la cantidad de encargados (para la tabla de mantenimiento)
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
    //Una sucursal por id, junto con la lista de sus encargados
    public function get($id)
    {
        try {
            $vSql = "SELECT id, name, description, address, phone, email, is_active
                     FROM branches WHERE id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                //Encargados de la sucursal
                $vResultado->managers = $this->getManagersBranch($id);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Encargados asignados a una sucursal
    public function getManagersBranch($idBranch)
    {
        try {
            $vSql = "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email
                     FROM users
                     WHERE branch_id = ? AND role_id = 2
                     ORDER BY first_name, last_name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            //Si no tiene encargados se devuelve la lista vacía
            return $vResultado ?? [];
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Encargados que se pueden escoger en el formulario: los que no tienen sucursal
    //y, si se está modificando una sucursal, también los que ya son de esa sucursal
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
    //Revisar si ya hay otra sucursal con ese nombre (al modificar no se compara consigo misma)
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
    //Crear sucursal
    public function create($objeto)
    {
        try {
            //Consulta sql (el id es autoincrementable)
            $sql = "INSERT INTO branches (name, description, address, phone, email)
                    VALUES (?, ?, ?, ?, ?);";
            //Ejecutar la consulta y obtener el id de la sucursal creada
            $idBranch = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->name,
                $objeto->description,
                $objeto->address,
                $objeto->phone,
                $objeto->email,
            ]);
            //--- Encargados ---
            //Con el id de la sucursal se le asigna cada encargado escogido
            //(solo si sigue sin sucursal, para no quitárselo a otra)
            foreach ($objeto->managers as $idManager) {
                $sql = "UPDATE users SET branch_id = ?
                        WHERE id = ? AND role_id = 2 AND branch_id IS NULL;";
                $vResultadoM = $this->enlace->executeSQL_DML($sql, [$idBranch, $idManager]);
            }
            //Retornar sucursal
            return $this->get($idBranch);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Actualizar sucursal (el id viene dentro del objeto)
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
            //--- Encargados ---
            //Igual que con los géneros de las películas: primero se quitan los que tenía
            //(quedan sin sucursal) y luego se asignan los que vienen del formulario
            $sql = "UPDATE users SET branch_id = NULL WHERE branch_id = ? AND role_id = 2;";
            $vResultadoD = $this->enlace->executeSQL_DML($sql, [$objeto->id]);
            foreach ($objeto->managers as $idManager) {
                $sql = "UPDATE users SET branch_id = ?
                        WHERE id = ? AND role_id = 2 AND branch_id IS NULL;";
                $vResultadoM = $this->enlace->executeSQL_DML($sql, [$objeto->id, $idManager]);
            }
            //Retornar sucursal
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
