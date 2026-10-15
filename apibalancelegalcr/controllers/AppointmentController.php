<?php
class appointment
{
    //GET Historial de reservas del encargado
    //localhost/appbalancelegalcr/apibalancelegalcr/appointment
    public function index()
    {
        try {
            //Encargado fijo establecido en el controlador (no lo puede cambiar el usuario)
            //Usuario 2: Adrián Pérez, encargado de la Oficina Central
            $idManager = 2;
            $response = new Response();
            $appointmentM = new AppointmentModel();
            $result = $appointmentM->getByManager($idManager);
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
}
