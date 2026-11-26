<?php
//localhost/appbalancelegalcr/apibalancelegalcr/image
class image
{
    //POST subir imagen, llega como form-data: file, type e id
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputFILE = $request->getBody();
            $image = new ImageModel();
            $result = $image->uploadFile($inputFILE);
            $response->toJSON($result, "No se pudo subir la imagen. Debe ser JPG, PNG o GIF de máximo 2 MB");
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
