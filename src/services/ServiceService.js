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
  getServiceById(serviceId) {
    return axios.get(BASE_URL + '/' + serviceId);
  }
  //Crear un servicio (POST, se manda en JSON)
  createService(service) {
    return axios.post(BASE_URL, service);
  }
  //Modificar un servicio (PUT, el id va dentro del objeto)
  updateService(service) {
    return axios.put(BASE_URL, service);
  }
  //Subir la imagen del servicio (POST con form-data: id e image)
  //localhost/appbalancelegalcr/apibalancelegalcr/service/image
  uploadImage(serviceId, file) {
    const formData = new FormData();
    formData.append('id', serviceId);
    formData.append('image', file);
    return axios.post(BASE_URL + '/image', formData);
  }
}

export default new ServiceService();
