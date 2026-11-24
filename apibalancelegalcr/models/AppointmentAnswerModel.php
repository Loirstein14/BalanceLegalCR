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
                       AND aa.appointment_id = ?
                     ORDER BY q.sort_order;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idAppointment]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Guardar la respuesta de una pregunta de la reserva
    public function create($idAppointment, $idQuestion, $answerText)
    {
        try {
            $sql = "INSERT INTO appointment_answers (appointment_id, question_id, answer_text)
                    VALUES (?, ?, ?);";
            return $this->enlace->executeSQL_DML($sql, [$idAppointment, $idQuestion, $answerText]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
