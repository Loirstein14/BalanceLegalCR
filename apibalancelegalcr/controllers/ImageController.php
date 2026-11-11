<?php
//localhost/appbalancelegalcr/apibalancelegalcr/image
class image
{
    //POST Subir imagen (llega como form-data: file, type e id)
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener los datos y el archivo enviados
            $inputFILE = $request->getBody();
            //Instancia del modelo
            $image = new ImageModel();
            //Acción del modelo a ejecutar
            $result = $image->uploadFile($inputFILE);
            //Dar respuesta
            $response->toJSON($result, "No se pudo subir la imagen. Debe ser JPG, PNG o GIF de máximo 2 MB");
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
