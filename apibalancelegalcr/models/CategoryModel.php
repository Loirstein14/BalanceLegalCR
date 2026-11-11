<?php
class CategoryModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Categorías activas (son las que salen en el select del formulario de productos)
    public function all()
    {
        try {
            $vSql = "SELECT id, name FROM product_categories WHERE is_active = 1 ORDER BY name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
