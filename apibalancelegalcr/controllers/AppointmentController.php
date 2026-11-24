<?php
class appointment
{
    //Encargado fijo establecido en el controlador (no lo puede cambiar el usuario)
    //Usuario 2: Adrián Pérez, encargado de la Oficina Central
    //Está aquí arriba porque lo usan varias acciones (historial, encargado, horas y crear)
    private $idManager = 2;
    //Estado con el que queda la reserva que registra el encargado: 1 = Pendiente
    private $initialStatus = 1;

    //GET Historial de reservas del encargado
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment
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
    //GET Reserva por id
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment/1
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
    //GET Datos del encargado fijo y su sucursal (encabezado del formulario de reserva)
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment/manager
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
    //GET Horas disponibles para un servicio en una fecha (en la sucursal del encargado)
    //La fecha va como aaaa-mm-dd
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment/availableHours/2026-11-25/1
    public function availableHours($date, $idService)
    {
        try {
            $response = new Response();
            //Revisar que la fecha venga bien: formato aaaa-mm-dd y que exista (no 2026-02-30)
            $parts = explode('-', $date);
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !checkdate($parts[1], $parts[2], $parts[0])) {
                $response->toJSON(null, "La fecha no es válida");
                return;
            }
            //La sucursal sale del encargado
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->availableHours($manager->branch_id, $date, $idService);
            $response->toJSON($result, "No hay horas disponibles para esa fecha y ese servicio");
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Estado inicial de la reserva con su color (se muestra en el formulario, no se puede cambiar)
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment/initialStatus
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
    //POST Crear reserva (con sus respuestas y su factura proforma)
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //La sucursal y el abogado salen del encargado fijo, no de lo que mande React
            $userM = new UserModel();
            $manager = $userM->getManager($this->idManager);
            //Revisar las reglas del negocio; si algo falla se le responde el mensaje al usuario
            $mensaje = $this->validar($inputJSON, $manager);
            if ($mensaje) {
                $response->toJSON(null, $mensaje);
                return;
            }
            //Instancia del modelo
            $appointmentM = new AppointmentModel();
            //Acción del modelo a ejecutar
            $result = $appointmentM->create($inputJSON, $manager, $this->initialStatus);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Reglas de la reserva. Devuelve el mensaje del error, o null si todo está bien
    private function validar($objeto, $manager)
    {
        $userM = new UserModel();
        $appointmentM = new AppointmentModel();
        $questionM = new BookingQuestionModel();
        //Datos obligatorios
        if (empty($objeto->client_id) || empty($objeto->service_id) || empty($objeto->date) || empty($objeto->start_time)) {
            return "Faltan datos de la reserva: cliente, servicio, fecha y hora son requeridos";
        }
        //El cliente tiene que existir, estar activo y tener rol Cliente
        if (empty($userM->getCustomer($objeto->client_id))) {
            return "El cliente seleccionado no existe o no está activo";
        }
        //Fecha con formato aaaa-mm-dd y que exista
        $parts = explode('-', $objeto->date);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $objeto->date) || !checkdate($parts[1], $parts[2], $parts[0])) {
            return "La fecha no es válida";
        }
        //La fecha no puede ser anterior a hoy (mismo método que se usa en horarios)
        $scheduleM = new ScheduleModel();
        if ($scheduleM->isPastDate($objeto->date)) {
            return "La fecha de la reserva no puede ser anterior a hoy";
        }
        //La hora tiene que estar entre las horas disponibles. Se reutiliza availableHours, que ya revisa:
        //fecha no pasada, servicio de la sucursal, dentro del horario, sin bloqueos y sin traslapes con otras citas
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
        //Preguntas del negocio: todas las requeridas contestadas y con el tipo correcto
        $answers = isset($objeto->answers) && is_array($objeto->answers) ? $objeto->answers : [];
        $questions = $questionM->all();
        foreach ($questions as $question) {
            //Buscar la respuesta de esta pregunta
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
        //No se aceptan respuestas de preguntas que no existen o no están activas
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
