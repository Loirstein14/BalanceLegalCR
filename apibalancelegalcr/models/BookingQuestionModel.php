<?php
class BookingQuestionModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //preguntas activas de la reserva en orden
    public function all()
    {
        try {
            $vSql = "SELECT id, question_text, answer_type, is_required
                     FROM booking_questions
                     WHERE is_active = 1
                     ORDER BY sort_order;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
