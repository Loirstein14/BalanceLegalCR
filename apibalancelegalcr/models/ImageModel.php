<?php
//Igual al ImageModel del ejemplo del profe (apimovie). La diferencia es que aquí
//la imagen no va en una tabla aparte (movie_image): se guarda el nombre del archivo
//en la columna image_path del producto o del servicio.
class ImageModel
{
    private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif');
    //Tablas que tienen imagen: según el "type" que mande React se escoge la tabla
    //(así nunca se mete en el SQL un nombre de tabla que venga del navegador)
    private $tables = array('product' => 'products', 'service' => 'services');

    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    //Subir la imagen de un producto o servicio ya registrado
    //Recibe: file (el archivo), type (product o service) e id (del producto o servicio)
    public function uploadFile($object)
    {
        try {
            $file = $object['file'];
            $type = $object['type'];
            $id = $object['id'];
            //Obtener la información del archivo
            $fileName = $file['name'];
            $tempPath = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];

            if (!empty($fileName) && isset($this->tables[$type])) {
                //Crear un nombre único para el archivo
                $fileExt = explode('.', $fileName);
                $fileActExt = strtolower(end($fileExt));
                $fileName = $type . "-" . uniqid() . "." . $fileActExt;
                //Validar el tipo de archivo
                if (in_array($fileActExt, $this->valid_extensions)) {
                    //Validar que no exista
                    if (!file_exists($this->upload_path . $fileName)) {
                        //Validar que no sobrepase el tamaño (2 MB)
                        if ($fileSize < 2000000 && $fileError == 0) {
                            //Moverlo a la carpeta del servidor del API
                            if (move_uploaded_file($tempPath, $this->upload_path . $fileName)) {
                                //Guardar el nombre del archivo en el producto o servicio
                                $sql = "UPDATE " . $this->tables[$type] . " SET image_path = ? WHERE id = ?";
                                $vResultado = $this->enlace->executeSQL_DML($sql, [$fileName, $id]);
                                if ($vResultado > 0) {
                                    return 'Imagen guardada';
                                }
                                return false;
                            }
                        }
                    }
                }
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
