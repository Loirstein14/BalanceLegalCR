import axios from 'axios';
//Ruta del API para los bloqueos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'block';

class BlockService {
  //Listado de bloqueos
  //localhost/appbalancelegalcr/apibalancelegalcr/block
  getBlocks() {
    return axios.get(BASE_URL);
  }
  //Obtener uno por su id
  //localhost/appbalancelegalcr/apibalancelegalcr/block/1
  getBlockById(BlockId) {
    return axios.get(BASE_URL + '/' + BlockId);
  }
  //Bloqueos de una sucursal
  //localhost/appbalancelegalcr/apibalancelegalcr/block/getByBranch/1
  getBlocksByBranch(BranchId) {
    return axios.get(BASE_URL + '/getByBranch/' + BranchId);
  }
  //Crear
  createBlock(Block) {
    return axios.post(BASE_URL, JSON.stringify(Block));
  }
  //Actualizar (el id va dentro del objeto)
  updateBlock(Block) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Block),
    });
  }
}
export default new BlockService();
