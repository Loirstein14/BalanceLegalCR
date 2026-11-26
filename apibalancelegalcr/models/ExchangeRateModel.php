<?php
//web service de Hacienda: tipo de cambio del dólar (el de referencia del BCCR)
//responde así: {"venta":{"fecha":"2026-11-25","valor":446.3},"compra":{"fecha":"2026-11-25","valor":441.1}}
class ExchangeRateModel
{
    private $url = 'https://api.hacienda.go.cr/indicadores/tc/dolar';

    //tipo de cambio del día, si Hacienda no responde devuelve null
    public function getDollar()
    {
        try {
            //se usa cURL y no file_get_contents porque si falla no tira warnings de PHP
            $curl = curl_init($this->url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); //que devuelva la respuesta como texto
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);           //esperar máximo 5 segundos
            $json = curl_exec($curl);
            $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            //si no respondió bien la app sigue igual, solo que sin dólares
            if ($json === false || $status != 200) {
                return null;
            }
            //el json de Hacienda se pasa a objeto con nombres en inglés como el resto del API
            $data = json_decode($json);
            if (!isset($data->venta->valor) || !isset($data->compra->valor)) {
                return null;
            }
            return (object) [
                'date' => $data->venta->fecha,
                'sale' => $data->venta->valor,
                'purchase' => $data->compra->valor,
                'source' => 'Ministerio de Hacienda',
            ];
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
