<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: *");
//Authorization va explícito porque el * no lo incluye (se va a ocupar para el token)
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/ValidationException.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";
require_once "controllers/core/Validator.php";
require_once "controllers/core/ImageUpload.php";

/***--- Agregar todos los modelos*/
require_once "models/ProductModel.php";
require_once "models/ServiceModel.php";
require_once "models/InvoiceItemModel.php";
require_once "models/InvoiceModel.php";
require_once "models/AppointmentAnswerModel.php";
require_once "models/AppointmentModel.php";

/***--- Agregar todos los controladores*/
require_once "controllers/ProductController.php";
require_once "controllers/ServiceController.php";
require_once "controllers/InvoiceController.php";
require_once "controllers/AppointmentController.php";

//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();


