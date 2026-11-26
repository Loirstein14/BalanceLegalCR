<?php
//localhost/appbalancelegalcr/apibalancelegalcr/question
class question
{
    //GET preguntas del form de reserva
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
