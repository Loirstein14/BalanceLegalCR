<?php
class AppointmentAnswerModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Obtener las preguntas de la reserva con sus respuestas
    public function getByAppointment($idAppointment)
    {
        try {
            $vSql = "SELECT q.id, q.question_text AS question, aa.answer_text AS answer
                     FROM appointment_answers aa, booking_questions q
                     WHERE aa.question_id = q.id
                       AND aa.appointment_id = $idAppointment
                     ORDER BY q.sort_order;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
