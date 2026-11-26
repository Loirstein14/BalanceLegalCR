<?php
class ServiceModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //servicios para la tabla de mantenimiento
    public function all()
    {
        try {
            $vSql = "SELECT id, name, price, duration_minutes, modality, image_path, is_active,
                            CASE modality WHEN 'virtual' THEN 'Virtual'
                                          WHEN 'home' THEN 'A domicilio'
                                          ELSE 'Presencial' END AS modality_name
                     FROM services
                     ORDER BY name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //servicio por id con las sucursales donde se da
    public function get($id)
    {
        try {
            $vSql = "SELECT s.id, s.name, s.description, s.price, s.duration_minutes, s.modality,
                            s.requirements, s.image_path, s.is_active,
                            CASE s.modality WHEN 'virtual' THEN 'Virtual'
                                            WHEN 'home' THEN 'A domicilio'
                                            ELSE 'Presencial' END AS modality_name,
                            GROUP_CONCAT(b.name ORDER BY b.name SEPARATOR ', ') AS branches
                     FROM services s
                     LEFT JOIN branch_services bs ON bs.service_id = s.id
                     LEFT JOIN branches b ON b.id = bs.branch_id
                     WHERE s.id = ?
                     GROUP BY s.id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //servicios activos de una sucursal
    public function getByBranch($idBranch)
    {
        try {
            $vSql = "SELECT s.id, s.name, s.price, s.duration_minutes
                     FROM services s, branch_services bs
                     WHERE bs.service_id = s.id
                       AND bs.branch_id = ?
                       AND s.is_active = 1
                     ORDER BY s.name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idBranch]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //ver si ya hay otro servicio con ese nombre
    public function nameExists($name, $idService = 0)
    {
        try {
            $vSql = "SELECT id FROM services WHERE name = ? AND id <> ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$name, $idService]);
            return !empty($vResultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function create($objeto)
    {
        try {
            $sql = "INSERT INTO services (name, description, price, duration_minutes, modality, requirements)
                    VALUES (?, ?, ?, ?, ?, ?);";
            $idService = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->name,
                $objeto->description,
                $objeto->price,
                $objeto->duration_minutes,
                $objeto->modality,
                $objeto->requirements,
            ]);
            return $this->get($idService);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //el id viene dentro del objeto
    public function update($objeto)
    {
        try {
            $sql = "UPDATE services
                    SET name = ?, description = ?, price = ?, duration_minutes = ?,
                        modality = ?, requirements = ?
                    WHERE id = ?;";
            $cResults = $this->enlace->executeSQL_DML($sql, [
                $objeto->name,
                $objeto->description,
                $objeto->price,
                $objeto->duration_minutes,
                $objeto->modality,
                $objeto->requirements,
                $objeto->id,
            ]);
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
