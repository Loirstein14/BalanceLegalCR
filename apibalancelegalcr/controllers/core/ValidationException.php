<?php
/**
 * Error de validación o de regla de negocio.
 * handleException() la convierte en una respuesta JSON con el código HTTP
 * indicado (422 por defecto) y la lista de errores por campo, para que
 * React pueda mostrarlos junto a cada campo del formulario.
 */
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
