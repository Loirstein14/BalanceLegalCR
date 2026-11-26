import axios from 'axios';
//ruta del API para el tipo de cambio
const BASE_URL = import.meta.env.VITE_BASE_URL + 'exchangerate';

class ExchangeRateService {
  //tipo de cambio del día
  getDollar() {
    return axios.get(BASE_URL);
  }
}

export default new ExchangeRateService();
