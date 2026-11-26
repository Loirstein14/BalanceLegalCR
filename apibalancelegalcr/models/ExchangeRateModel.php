<?php
//web service de Hacienda para el tipo de cambio
class ExchangeRateModel
{
    private $url = 'https://api.hacienda.go.cr/indicadores/tc/dolar';

    //tipo de cambio del día o null si Hacienda no responde
    public function getDollar()
    {
        try {
            //cURL no tira warnings si falla
            $curl = curl_init($this->url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); //que devuelva la respuesta como texto
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);           //esperar máximo 5 segundos
            $json = curl_exec($curl);
            $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            //si falla la app sigue sin los dólares
            if ($json === false || $status != 200) {
                return null;
            }
            //se pasa el json de Hacienda a un objeto
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
