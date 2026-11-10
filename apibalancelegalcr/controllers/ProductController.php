<?php
class product
{
    //Formatos de entrega que se permiten (iguales al ENUM de la BD)
    const DELIVERY_FORMATS = ['physical', 'digital'];

    //GET Listado de productos
    //localhost/appbalancelegalcr/apibalancelegalcr/product
    public function index()
    {
        try {
            $response = new Response();
            $productM = new ProductModel();
            $result = $productM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Producto por id
    //localhost/appbalancelegalcr/apibalancelegalcr/product/1
    public function get($id)
    {
        try {
            $response = new Response();
            $productM = new ProductModel();
            $result = $productM->get((int) $id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST Crear producto (los datos llegan en JSON)
    //localhost/appbalancelegalcr/apibalancelegalcr/product
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $productM = new ProductModel();
            $this->validate($inputJSON, $productM);
            $response->status(201)->toJSON($productM->create($inputJSON)); //201 = creado
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //PUT Modificar producto (el id viene dentro del JSON)
    //localhost/appbalancelegalcr/apibalancelegalcr/product
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $productM = new ProductModel();
            //Primero ver que el producto sí exista
            $id = filter_var($inputJSON->id ?? null, FILTER_VALIDATE_INT);
            if (!$id || !$productM->get($id)) {
                throw new ValidationException(['id' => 'El producto no existe'], 'El producto no existe', 404);
            }
            $inputJSON->id = $id;
            $this->validate($inputJSON, $productM, $id);
            $response->toJSON($productM->update($inputJSON));
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST Subir o cambiar la imagen del producto (form-data con id e image)
    //localhost/appbalancelegalcr/apibalancelegalcr/product/image
    public function image()
    {
        try {
            $response = new Response();
            $productM = new ProductModel();
            $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
            $product = $id ? $productM->get($id) : null;
            if (!$product) {
                throw new ValidationException(['id' => 'El producto no existe'], 'El producto no existe', 404);
            }
            $fileName = ImageUpload::save($_FILES['image'] ?? null, 'product-' . $id);
            $result = $productM->updateImage($id, $fileName);
            ImageUpload::delete($product->image_path); //La imagen vieja ya no se ocupa
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Validaciones del producto; si algo está mal tira ValidationException con los errores
    private function validate($data, ProductModel $productM, $id = 0)
    {
        if (!is_object($data)) {
            throw new ValidationException([], 'No se recibieron datos');
        }
        $v = new Validator($data);
        $v->required('name', 'Nombre')->minLength('name', 3, 'Nombre')->maxLength('name', 120, 'Nombre')
            ->required('description', 'Descripción')->minLength('description', 10, 'Descripción')->maxLength('description', 1000, 'Descripción')
            ->required('price', 'Precio')->decimal('price', 1, 9999999, 'Precio')
            ->required('category_id', 'Categoría')->integer('category_id', 1, PHP_INT_MAX, 'Categoría')
            ->required('delivery_format', 'Formato de entrega')->in('delivery_format', self::DELIVERY_FORMATS, 'Formato de entrega')
            ->required('delivery_days', 'Tiempo de entrega')->integer('delivery_days', 0, 30, 'Tiempo de entrega');
        //La categoría tiene que existir en la BD
        $categoryM = new CategoryModel();
        if (!empty($data->category_id) && filter_var($data->category_id, FILTER_VALIDATE_INT) && !$categoryM->exists($data->category_id)) {
            $v->addError('category_id', 'La categoría no existe');
        }
        //No pueden haber dos productos con el mismo nombre
        if (!empty($data->name) && $productM->nameExists($data->name, $id)) {
            $v->addError('name', 'Ya existe un producto con ese nombre');
        }
        $v->validate();
    }
}