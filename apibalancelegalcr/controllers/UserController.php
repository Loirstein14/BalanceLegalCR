<?php
//localhost/appbalancelegalcr/apibalancelegalcr/user
class user
{
    //GET clientes para reservas y facturas
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
