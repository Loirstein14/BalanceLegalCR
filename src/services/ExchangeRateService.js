import axios from 'axios';
//ruta del API para el tipo de cambio (el API es el que llama a Hacienda)
const BASE_URL = import.meta.env.VITE_BASE_URL + 'exchangerate';

class ExchangeRateService {
  //tipo de cambio del día: fecha, venta y compra
  //localhost/appbalancelegalcr/apibalancelegalcr/exchangerate
  getDollar() {
    return axios.get(BASE_URL);
  }
}

export default new ExchangeRateService();
