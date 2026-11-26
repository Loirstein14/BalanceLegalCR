<?php
//igual al ImageModel del profe pero con image_path
class ImageModel
{
    private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif');
    //la tabla se escoge según el type que llega
    private $tables = array('product' => 'products', 'service' => 'services');

    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    //subir la imagen de un producto o servicio
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
                        //validar que no pase de 2 MB
                        if ($fileSize < 2000000 && $fileError == 0) {
                            //Moverlo a la carpeta del servidor del API
                            if (move_uploaded_file($tempPath, $this->upload_path . $fileName)) {
                                //guardar el nombre del archivo en el producto o servicio
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
