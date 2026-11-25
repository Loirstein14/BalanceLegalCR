<?php
//Web service externo: tipo de cambio del dólar del Ministerio de Hacienda de Costa Rica
//(publica el tipo de cambio de referencia del Banco Central)
//Respuesta de Hacienda: {"venta":{"fecha":"2026-11-25","valor":446.3},"compra":{"fecha":"2026-11-25","valor":441.1}}
class ExchangeRateModel
{
    private $url = 'https://api.hacienda.go.cr/indicadores/tc/dolar';

    //Consultar el tipo de cambio del día. Devuelve null si Hacienda no responde
    public function getDollar()
    {
        try {
            //Se usa cURL (y no file_get_contents) porque si falla devuelve false sin generar advertencias de PHP
            $curl = curl_init($this->url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); //Devolver la respuesta como texto
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);           //Esperar máximo 5 segundos
            $json = curl_exec($curl);
            $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            //Si no hubo respuesta o no fue 200, la app sigue funcionando sin el tipo de cambio
            if ($json === false || $status != 200) {
                return null;
            }
            //Pasar el JSON de Hacienda a objeto y armar la respuesta con nombres en inglés como el resto del API
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
