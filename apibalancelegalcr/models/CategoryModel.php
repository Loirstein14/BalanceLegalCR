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
            return $this->enlace->executeSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Revisa que la categoría exista y esté activa
    public function exists($id)
    {
        $vSql = "SELECT id FROM product_categories WHERE id = ? AND is_active = 1;";
        return !empty($this->enlace->executeSQL($vSql, [$id]));
    }
}
