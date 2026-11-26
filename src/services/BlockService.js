import axios from 'axios';
//ruta del API para los bloqueos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'block';

class BlockService {
  //localhost/appbalancelegalcr/apibalancelegalcr/block
  getBlocks() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/block/1
  getBlockById(BlockId) {
    return axios.get(BASE_URL + '/' + BlockId);
  }
  //bloqueos de una sucursal
  //localhost/appbalancelegalcr/apibalancelegalcr/block/getByBranch/1
  getBlocksByBranch(BranchId) {
    return axios.get(BASE_URL + '/getByBranch/' + BranchId);
  }
  //crear, llega un rango y el API crea uno por día
  createBlock(Block) {
    return axios.post(BASE_URL, JSON.stringify(Block));
  }
  //el id va dentro del objeto
  updateBlock(Block) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Block),
    });
  }
}
export default new BlockService();
