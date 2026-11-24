<?php
class appointment
{
    //Encargado fijo establecido en el controlador (no lo puede cambiar el usuario)
    //Usuario 2: Adrián Pérez, encargado de la Oficina Central
    //Está aquí arriba porque lo usan varias acciones (historial, encargado, horas y crear)
    private $idManager = 2;

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
}
