<?php
class UserModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //clientes activos con nombre y correo
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
    //un cliente activo por id
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
    //encargado con su sucursal y su provider
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
