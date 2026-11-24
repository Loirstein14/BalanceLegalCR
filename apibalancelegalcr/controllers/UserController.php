<?php
//localhost/appbalancelegalcr/apibalancelegalcr/user
class user
{
    //GET Clientes para los formularios de reserva y factura
    //localhost/appbalancelegalcr/apibalancelegalcr/user/allCustomer
    public function allCustomer()
    {
        try {
            $response = new Response();
            $userM = new UserModel();
            $result = $userM->allCustomer();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
