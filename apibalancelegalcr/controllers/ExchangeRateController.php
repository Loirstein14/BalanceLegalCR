<?php
//localhost/appbalancelegalcr/apibalancelegalcr/exchangerate
class exchangerate
{
    //GET Tipo de cambio del dólar (consumo del web service de Hacienda)
    public function index()
    {
        try {
            $response = new Response();
            $exchangeM = new ExchangeRateModel();
            $result = $exchangeM->getDollar();
            $response->toJSON($result, "No se pudo consultar el tipo de cambio en este momento");
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
