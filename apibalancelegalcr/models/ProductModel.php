<?php
class ProductModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Obtener el listado de productos activos
    public function all()
    {
        try {
            $vSql = "SELECT p.id, p.name, p.price, p.image_path, c.name AS category
                     FROM products p, product_categories c
                     WHERE p.category_id = c.id AND p.is_active = 1
                     ORDER BY p.name;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Obtener un producto por su id
    public function get($id)
    {
        try {
            $vSql = "SELECT p.id, p.name, p.description, p.price, p.image_path, p.delivery_days,
                            c.name AS category,
                            CASE p.delivery_format WHEN 'digital' THEN 'Digital' ELSE 'Físico' END AS delivery_format
                     FROM products p, product_categories c
                     WHERE p.category_id = c.id AND p.id = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                return $vResultado[0]; //Un solo producto
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}