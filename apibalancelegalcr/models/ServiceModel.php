<?php
class ServiceModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Todos los servicios (activos e inactivos) para la tabla de mantenimiento
    public function all()
    {
        try {
            $vSql = "SELECT id, name, price, duration_minutes, modality, image_path, is_active
                     FROM services
                     ORDER BY name;";
            return $this->enlace->executeSQL($vSql);
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
                            GROUP_CONCAT(b.name ORDER BY b.name SEPARATOR ', ') AS branches
                     FROM services s
                     LEFT JOIN branch_services bs ON bs.service_id = s.id
                     LEFT JOIN branches b ON b.id = bs.branch_id
                     WHERE s.id = ?
                     GROUP BY s.id;";
            $vResultado = $this->enlace->executeSQL($vSql, [$id]);
            return $vResultado[0] ?? null; //Un solo servicio
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Revisa si ya hay otro servicio con ese nombre ($excludeId es para que al modificar no se compare consigo mismo)
    public function nameExists($name, $excludeId = 0)
    {
        $vSql = "SELECT id FROM services WHERE name = ? AND id <> ?;";
        $vResultado = $this->enlace->executeSQL($vSql, [trim($name), $excludeId]);
        return !empty($vResultado);
    }
    //Crear el servicio y devolverlo ya con su id
    public function create($objeto)
    {
        try {
            $vSql = "INSERT INTO services (name, description, price, duration_minutes, modality, requirements)
                     VALUES (?, ?, ?, ?, ?, ?);";
            $idService = $this->enlace->executeSQL_DML_last($vSql, [
                trim($objeto->name),
                trim($objeto->description),
                $objeto->price,
                $objeto->duration_minutes,
                $objeto->modality,
                $this->nullIfEmpty($objeto->requirements ?? null),
            ]);
            return $this->get($idService);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Modificar el servicio (el id viene en el objeto) y devolverlo actualizado
    public function update($objeto)
    {
        try {
            $vSql = "UPDATE services
                     SET name = ?, description = ?, price = ?, duration_minutes = ?,
                         modality = ?, requirements = ?
                     WHERE id = ?;";
            $this->enlace->executeSQL_DML($vSql, [
                trim($objeto->name),
                trim($objeto->description),
                $objeto->price,
                $objeto->duration_minutes,
                $objeto->modality,
                $this->nullIfEmpty($objeto->requirements ?? null),
                $objeto->id,
            ]);
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Guardar el nombre del archivo de la imagen
    public function updateImage($id, $imagePath)
    {
        try {
            $vSql = "UPDATE services SET image_path = ? WHERE id = ?;";
            $this->enlace->executeSQL_DML($vSql, [$imagePath, $id]);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Si el texto viene vacío se guarda NULL
    private function nullIfEmpty($value)
    {
        $value = is_string($value) ? trim($value) : $value;
        return ($value === '' || $value === null) ? null : $value;
    }
}
