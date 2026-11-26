import axios from 'axios';
//ruta del API para las sucursales
const BASE_URL = import.meta.env.VITE_BASE_URL + 'branch';

class BranchService {
  //localhost/appbalancelegalcr/apibalancelegalcr/branch
  getBranches() {
    return axios.get(BASE_URL);
  }
  //sucursal con sus encargados
  getBranchById(BranchId) {
    return axios.get(BASE_URL + '/' + BranchId);
  }
  //encargados que se pueden escoger
  getAvailableManagers(BranchId) {
    return axios.get(BASE_URL + '/managers' + (BranchId ? '/' + BranchId : ''));
  }
  //managers es un arreglo con los ids de los encargados
  createBranch(Branch) {
    return axios.post(BASE_URL, JSON.stringify(Branch));
  }
  //el id va dentro del objeto
  updateBranch(Branch) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Branch),
    });
  }
}
export default new BranchService();
