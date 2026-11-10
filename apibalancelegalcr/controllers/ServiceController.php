<?php
class service
{
    //Valores que se permiten (iguales al ENUM de la BD y a las opciones del form)
    const MODALITIES = ['in_person', 'virtual', 'home'];
    const DURATIONS = [60, 120]; //Solo servicios de 1 o 2 horas (como dijo el profe)

    //GET Listado de servicios
    //localhost/appbalancelegalcr/apibalancelegalcr/service
    public function index()
    {
        try {
            $response = new Response();
            $serviceM = new ServiceModel();
            $response->toJSON($serviceM->all());
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Servicio por id
    //localhost/appbalancelegalcr/apibalancelegalcr/service/1
    public function get($id)
    {
        try {
            $response = new Response();
            $serviceM = new ServiceModel();
            $response->toJSON($serviceM->get((int) $id));
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST Crear servicio (los datos llegan en JSON)
    //localhost/appbalancelegalcr/apibalancelegalcr/service
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $serviceM = new ServiceModel();
            $this->validate($inputJSON, $serviceM);
            $result = $serviceM->create($inputJSON);
            $response->status(201)->toJSON($result); //201 = creado
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //PUT Modificar servicio (el id viene dentro del JSON)
    //localhost/appbalancelegalcr/apibalancelegalcr/service
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $serviceM = new ServiceModel();
            //Primero ver que el servicio sí exista
            $id = filter_var($inputJSON->id ?? null, FILTER_VALIDATE_INT);
            if (!$id || !$serviceM->get($id)) {
                throw new ValidationException(['id' => 'El servicio no existe'], 'El servicio no existe', 404);
            }
            $inputJSON->id = $id;
            $this->validate($inputJSON, $serviceM, $id);
            $response->toJSON($serviceM->update($inputJSON));
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST Subir o cambiar la imagen del servicio (form-data con id e image)
    //localhost/appbalancelegalcr/apibalancelegalcr/service/image
    public function image()
    {
        try {
            $response = new Response();
            $serviceM = new ServiceModel();
            $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
            $service = $id ? $serviceM->get($id) : null;
            if (!$service) {
                throw new ValidationException(['id' => 'El servicio no existe'], 'El servicio no existe', 404);
            }
            $fileName = ImageUpload::save($_FILES['image'] ?? null, 'service-' . $id);
            $result = $serviceM->updateImage($id, $fileName);
            ImageUpload::delete($service->image_path); //La imagen vieja ya no se ocupa
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Validaciones del servicio; si algo está mal tira ValidationException con los errores
    private function validate($data, ServiceModel $serviceM, $id = 0)
    {
        if (!is_object($data)) {
            throw new ValidationException([], 'No se recibieron datos');
        }
        $v = new Validator($data);
        $v->required('name', 'Nombre')->minLength('name', 3, 'Nombre')->maxLength('name', 120, 'Nombre')
            ->required('description', 'Descripción')->minLength('description', 10, 'Descripción')->maxLength('description', 1000, 'Descripción')
            ->required('price', 'Precio')->decimal('price', 1, 9999999, 'Precio')
            ->required('duration_minutes', 'Duración')->in('duration_minutes', self::DURATIONS, 'Duración')
            ->required('modality', 'Modalidad')->in('modality', self::MODALITIES, 'Modalidad')
            ->maxLength('requirements', 500, 'Requisitos');
        //No pueden haber dos servicios con el mismo nombre
        if (!empty($data->name) && $serviceM->nameExists($data->name, $id)) {
            $v->addError('name', 'Ya existe un servicio con ese nombre');
        }
        $v->validate();
    }
}
