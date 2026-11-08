<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
set_exception_handler('handleException');
set_error_handler('handleError');

function handleException($exception) {
    // Errores de validación o de reglas de negocio: respuesta controlada,
    // con el mensaje y los errores por campo (no es un error del servidor)
    if ($exception instanceof ValidationException) {
        http_response_code($exception->getCode());
        echo json_encode([
            'status' => 'error',
            'message' => $exception->getMessage(),
            'errors' => $exception->getErrors()
        ]);
        exit;
    }
    $log = new Logger();
    $error=[
        'status' => 'error',
        'message' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine()
    ];
    $log->error("File: ".$error["file"]." - line: ".$error["line"]." - Message: ".$error["message"]);
    http_response_code(500);
    echo json_encode($error);
    exit;
}

function handleError($errno, $errstr, $errfile, $errline) {
    $log = new Logger();
    $error=[
        'status' => 'error',
        'message' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ];
    $log->error("File: ".$error["file"]." - line: ".$error["line"]." - Message: ".$error["message"]);
    http_response_code(500);
    echo json_encode($error);
    exit;
}