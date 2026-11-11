import axios from 'axios';
//Ruta del API para los servicios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'service';

class ServiceService {
  //Listado de servicios
  //localhost/appbalancelegalcr/apibalancelegalcr/service
  getServices() {
    return axios.get(BASE_URL);
  }
  //Obtener un servicio por su id
  //localhost/appbalancelegalcr/apibalancelegalcr/service/1
  getServiceById(ServiceId) {
    return axios.get(BASE_URL + '/' + ServiceId);
  }
  //Crear servicio
  createService(Service) {
    return axios.post(BASE_URL, JSON.stringify(Service));
  }
  //Actualizar servicio (el id va dentro del objeto)
  updateService(Service) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Service),
    });
  }
}
export default new ServiceService();
