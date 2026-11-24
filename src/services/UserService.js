import axios from 'axios';
//Ruta del API para los usuarios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

class UserService {
  //Clientes activos (nombre completo y correo) para la reserva y la factura
  //localhost/appbalancelegalcr/apibalancelegalcr/user/allCustomer
  getCustomers() {
    return axios.get(BASE_URL + '/allCustomer');
  }
}

export default new UserService();
