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
                            p.category_id, p.delivery_format AS delivery_format_code,
                            c.name AS category,
                            CASE p.delivery_format WHEN 'digital' THEN 'Digital' ELSE 'Físico' END AS delivery_format
                     FROM products p, product_categories c
                     WHERE p.category_id = c.id AND p.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            return $vResultado[0] ?? null; //Un solo producto
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Revisa si ya hay otro producto con ese nombre ($excludeId es para que al modificar no se compare consigo mismo)
    public function nameExists($name, $excludeId = 0)
    {
        $vSql = "SELECT id FROM products WHERE name = ? AND id <> ?;";
        return !empty($this->enlace->executeSQL($vSql, [trim($name), $excludeId]));
    }
    //Crear el producto y devolverlo ya con su id
    public function create($objeto)
    {
        try {
            $vSql = "INSERT INTO products (category_id, name, description, price, delivery_format, delivery_days)
                     VALUES (?, ?, ?, ?, ?, ?);";
            $idProduct = $this->enlace->executeSQL_DML_last($vSql, [
                $objeto->category_id,
                trim($objeto->name),
                trim($objeto->description),
                $objeto->price,
                $objeto->delivery_format,
                $objeto->delivery_days,
            ]);
            return $this->get($idProduct);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Modificar el producto (el id viene en el objeto) y devolverlo actualizado
    public function update($objeto)
    {
        try {
            $vSql = "UPDATE products
                     SET category_id = ?, name = ?, description = ?, price = ?,
                         delivery_format = ?, delivery_days = ?
                     WHERE id = ?;";
            $this->enlace->executeSQL_DML($vSql, [
                $objeto->category_id,
                trim($objeto->name),
                trim($objeto->description),
                $objeto->price,
                $objeto->delivery_format,
                $objeto->delivery_days,
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
            $vSql = "UPDATE products SET image_path = ? WHERE id = ?;";
            $this->enlace->executeSQL_DML($vSql, [$imagePath, $id]);
            return $this->get($id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}