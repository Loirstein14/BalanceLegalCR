import axios from 'axios';
//Ruta del API para las sucursales
const BASE_URL = import.meta.env.VITE_BASE_URL + 'branch';

class BranchService {
  //Listado de sucursales
  //localhost/appbalancelegalcr/apibalancelegalcr/branch
  getBranches() {
    return axios.get(BASE_URL);
  }
  //Obtener una sucursal por su id (trae también sus encargados)
  //localhost/appbalancelegalcr/apibalancelegalcr/branch/1
  getBranchById(BranchId) {
    return axios.get(BASE_URL + '/' + BranchId);
  }
  //Encargados que se pueden escoger: los que no tienen sucursal
  //y, si se manda el id, también los de esa sucursal
  //localhost/appbalancelegalcr/apibalancelegalcr/branch/managers/1
  getAvailableManagers(BranchId) {
    return axios.get(BASE_URL + '/managers' + (BranchId ? '/' + BranchId : ''));
  }
  //Crear sucursal (managers es un arreglo con los ids de los encargados)
  createBranch(Branch) {
    return axios.post(BASE_URL, JSON.stringify(Branch));
  }
  //Actualizar sucursal (el id va dentro del objeto)
  updateBranch(Branch) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Branch),
    });
  }
}
export default new BranchService();
