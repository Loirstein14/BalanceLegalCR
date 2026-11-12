<?php
class ServiceModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Todos los servicios para la tabla de mantenimiento
    //modality_name: la modalidad en español, igual que se hizo con delivery_format en productos
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
    //Un servicio por id, junto con las sucursales donde se ofrece
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
                return $vResultado[0]; //Un solo servicio
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Revisar si ya hay otro servicio con ese nombre (al modificar no se compara consigo mismo)
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
    //Crear servicio
    public function create($objeto)
    {
        try {
            //Consulta sql (el id es autoincrementable)
            $sql = "INSERT INTO services (name, description, price, duration_minutes, modality, requirements)
                    VALUES (?, ?, ?, ?, ?, ?);";
            //Ejecutar la consulta y obtener el id del servicio creado
            $idService = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->name,
                $objeto->description,
                $objeto->price,
                $objeto->duration_minutes,
                $objeto->modality,
                $objeto->requirements,
            ]);
            //Retornar el servicio
            return $this->get($idService);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Actualizar servicio (el id viene dentro del objeto)
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
            //Retornar el servicio
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
