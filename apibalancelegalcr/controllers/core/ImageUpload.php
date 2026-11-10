<?php
//Para guardar en uploads/ las imágenes que se suben (multipart/form-data).
//Revisa que sí haya llegado, que no pase de 2 MB y el tipo real del archivo
//(con finfo, no nos fiamos de la extensión). Devuelve el nombre con que se guardó,
//por ejemplo: service-5-1731280000.jpg
class ImageUpload
{
    const MAX_BYTES = 2 * 1024 * 1024;
    const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    public static function save(?array $file, string $prefix): string
    {
        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            throw new ValidationException(['image' => 'Debe seleccionar una imagen']);
        }
        if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE]) || $file['size'] > self::MAX_BYTES) {
            throw new ValidationException(['image' => 'La imagen no puede superar 2 MB']);
        }
        if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            throw new ValidationException(['image' => 'No se pudo recibir la imagen, intente de nuevo']);
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!isset(self::TYPES[$mime])) {
            throw new ValidationException(['image' => 'La imagen debe ser JPG, PNG o WEBP']);
        }
        //Nombre: prefijo + la hora actual, así el navegador no se queda con la imagen vieja en caché
        $fileName = $prefix . '-' . time() . '.' . self::TYPES[$mime];
        if (!move_uploaded_file($file['tmp_name'], __DIR__ . '/../../uploads/' . $fileName)) {
            throw new Exception('No se pudo guardar la imagen en el servidor');
        }
        return $fileName;
    }

    //Borrar la imagen vieja (solo dentro de uploads/)
    public static function delete(?string $fileName): void
    {
        if ($fileName) {
            $path = __DIR__ . '/../../uploads/' . basename($fileName);
            if (is_file($path)) {
                unlink($path);
            }
        }
    }
}
