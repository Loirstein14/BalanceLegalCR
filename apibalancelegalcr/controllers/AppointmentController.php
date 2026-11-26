<?php
class appointment
{
    //encargado fijo 2 Adrián Pérez se cambia aquí y en InvoiceController
    private $idManager = 2;
    //estado de la reserva nueva 1 Pendiente
    private $initialStatus = 1;

    //GET historial de reservas del encargado
    public function index()
    {
        try {
            $response = new Response();
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->getByManager($this->idManager);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET reserva por id
    public function get($id)
    {
        try {
            $response = new Response();
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET encargado y su sucursal
    public function manager()
    {
        try {
            $response = new Response();
            $userM = new UserModel();
            $result = $userM->getManager($this->idManager);
            $response->toJSON($result, "No se encontró el encargado");
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET horas libres de un servicio en una fecha
    public function availableHours($date, $idService)
    {
        try {
            $response = new Response();
            //que la fecha venga bien y que exista
            $parts = explode('-', $date);
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !checkdate($parts[1], $parts[2], $parts[0])) {
                $response->toJSON(null, "La fecha no es válida");
                return;
            }
            //la sucursal sale del encargado
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->availableHours($manager->branch_id, $date, $idService);
            $response->toJSON($result, "No hay horas disponibles para esa fecha y ese servicio");
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET estado inicial con su color
    public function initialStatus()
    {
        try {
            $response = new Response();
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->getStatus($this->initialStatus);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //POST crear reserva con respuestas y proforma
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            //la sucursal y el abogado salen del encargado
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            //si alguna regla falla se le devuelve el mensaje
            $mensaje = $this->validar($inputJSON, $manager);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->create($inputJSON, $manager, $this->initialStatus);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //reglas de la reserva devuelve el error o null
    private function validar($objeto, $manager)
    {
        $userM = new UserModel();
        $appointmentM = new AppointmentModel();
        $questionM = new BookingQuestionModel();
        if (empty($objeto->client_id) || empty($objeto->service_id) || empty($objeto->date) || empty($objeto->start_time)) {
            return "Faltan datos de la reserva: cliente, servicio, fecha y hora son requeridos";
        }
        //el cliente tiene que existir y estar activo
        if (empty($userM->getCustomer($objeto->client_id))) {
            return "El cliente seleccionado no existe o no está activo";
        }
        $parts = explode('-', $objeto->date);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $objeto->date) || !checkdate($parts[1], $parts[2], $parts[0])) {
            return "La fecha no es válida";
        }
        //no se puede reservar en una fecha que ya pasó
        $scheduleM = new ScheduleModel();
        if ($scheduleM->isPastDate($objeto->date)) {
            return "La fecha de la reserva no puede ser anterior a hoy";
        }
        //la hora tiene que estar en las horas libres
        $hours = $appointmentM->availableHours($manager->branch_id, $objeto->date, $objeto->service_id);
        $disponible = false;
        foreach ($hours as $hour) {
            if ($hour->start_time == $objeto->start_time) {
                $disponible = true;
            }
        }
        if (!$disponible) {
            return "La hora seleccionada ya no está disponible para ese servicio. Escoja otra hora";
        }
        //las preguntas obligatorias tienen que venir bien
        $answers = isset($objeto->answers) && is_array($objeto->answers) ? $objeto->answers : [];
        $questions = $questionM->all();
        foreach ($questions as $question) {
            $text = '';
            foreach ($answers as $answer) {
                if ($answer->question_id == $question->id) {
                    $text = trim($answer->answer_text);
                }
            }
            if ($question->is_required && $text === '') {
                return "Falta responder la pregunta: $question->question_text";
            }
            if ($question->answer_type == 'yes_no' && $text !== '' && $text != 'Sí' && $text != 'No') {
                return "La respuesta de \"$question->question_text\" debe ser Sí o No";
            }
            if ($question->answer_type == 'number' && $text !== '' && !ctype_digit($text)) {
                return "La respuesta de \"$question->question_text\" debe ser un número entero";
            }
        }
        //no se aceptan respuestas de preguntas que no existen
        foreach ($answers as $answer) {
            $existe = false;
            foreach ($questions as $question) {
                if ($answer->question_id == $question->id) {
                    $existe = true;
                }
            }
            if (!$existe) {
                return "Una de las respuestas no corresponde a una pregunta del formulario";
            }
        }
        return null;
    }
}
