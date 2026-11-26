import axios from 'axios';
//ruta del API para los usuarios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

class UserService {
  //clientes activos con nombre completo y correo
  //localhost/appbalancelegalcr/apibalancelegalcr/user/allCustomer
  getCustomers() {
    return axios.get(BASE_URL + '/allCustomer');
  }
}

export default new UserService();
