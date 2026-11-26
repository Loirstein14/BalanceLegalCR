<?php
class UserModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //clientes activos (role_id 1) para el select de reserva y factura
    //va el nombre completo y el correo para mostrarlos al escoger
    public function allCustomer()
    {
        try {
            $vSql = "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email
                     FROM users
                     WHERE role_id = 1 AND is_active = 1
                     ORDER BY first_name, last_name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //un cliente activo por id, para validar el que viene en la reserva
    public function getCustomer($id)
    {
        try {
            $vSql = "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email
                     FROM users
                     WHERE role_id = 1 AND is_active = 1 AND id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //encargado (role_id 2) con su sucursal y su registro en providers
    //provider_id es el abogado de la cita: la atiende el encargado que la registra
    public function getManager($idManager)
    {
        try {
            $vSql = "SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) AS name,
                            u.branch_id, b.name AS branch, p.id AS provider_id
                     FROM users u, branches b, providers p
                     WHERE u.branch_id = b.id
                       AND p.user_id = u.id
                       AND u.role_id = 2
                       AND u.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idManager]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
