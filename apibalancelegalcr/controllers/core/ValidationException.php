<?php
//Excepción para cuando los datos no pasan las validaciones o rompen una regla del negocio.
//handleException() la agarra y responde un JSON con el código (422 por defecto)
//y los errores por campo, así React los muestra debajo de cada campo.
class ValidationException extends Exception
{
    private array $errors;

    public function __construct(array $errors, string $message = 'Los datos enviados no son válidos', int $code = 422)
    {
        parent::__construct($message, $code);
        $this->errors = $errors;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
