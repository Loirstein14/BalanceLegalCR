import axios from 'axios';
//ruta del API para los servicios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'service';

class ServiceService {
  //localhost/appbalancelegalcr/apibalancelegalcr/service
  getServices() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/service/1
  getServiceById(ServiceId) {
    return axios.get(BASE_URL + '/' + ServiceId);
  }
  //servicios activos de una sucursal
  getServicesByBranch(BranchId) {
    return axios.get(BASE_URL + '/getByBranch/' + BranchId);
  }
  createService(Service) {
    return axios.post(BASE_URL, JSON.stringify(Service));
  }
  //el id va dentro del objeto
  updateService(Service) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Service),
    });
  }
}
export default new ServiceService();
