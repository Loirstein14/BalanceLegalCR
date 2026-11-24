<?php
//localhost/appbalancelegalcr/apibalancelegalcr/question
class question
{
    //GET Preguntas del formulario de reserva
    public function index()
    {
        try {
            $response = new Response();
            $questionM = new BookingQuestionModel();
            $result = $questionM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
