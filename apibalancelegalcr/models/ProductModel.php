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
            //category_id y delivery_format_code se ocupan para precargar el formulario de modificar
            $vSql = "SELECT p.id, p.name, p.description, p.price, p.image_path, p.delivery_days,
                            p.category_id, p.delivery_format AS delivery_format_code,
                            c.name AS category,
                            CASE p.delivery_format WHEN 'digital' THEN 'Digital' ELSE 'Físico' END AS delivery_format
                     FROM products p, product_categories c
                     WHERE p.category_id = c.id AND p.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                return $vResultado[0]; //Un solo producto
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Revisar si ya hay otro producto con ese nombre (al modificar no se compara consigo mismo)
    public function nameExists($name, $idProduct = 0)
    {
        try {
            $vSql = "SELECT id FROM products WHERE name = ? AND id <> ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$name, $idProduct]);
            return !empty($vResultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Crear producto
    public function create($objeto)
    {
        try {
            //Consulta sql (el id es autoincrementable)
            $sql = "INSERT INTO products (category_id, name, description, price, delivery_format, delivery_days)
                    VALUES (?, ?, ?, ?, ?, ?);";
            //Ejecutar la consulta y obtener el id del producto creado
            $idProduct = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->category_id,
                $objeto->name,
                $objeto->description,
                $objeto->price,
                $objeto->delivery_format,
                $objeto->delivery_days,
            ]);
            //Retornar el producto
            return $this->get($idProduct);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Actualizar producto (el id viene dentro del objeto)
    public function update($objeto)
    {
        try {
            $sql = "UPDATE products
                    SET category_id = ?, name = ?, description = ?, price = ?,
                        delivery_format = ?, delivery_days = ?
                    WHERE id = ?;";
            $cResults = $this->enlace->executeSQL_DML($sql, [
                $objeto->category_id,
                $objeto->name,
                $objeto->description,
                $objeto->price,
                $objeto->delivery_format,
                $objeto->delivery_days,
                $objeto->id,
            ]);
            //Retornar el producto
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
