<?php
class BookingQuestionModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Preguntas activas del formulario de reserva, en el orden en que se muestran
    //answer_type dice qué campo pintar en React: text, yes_no o number
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
