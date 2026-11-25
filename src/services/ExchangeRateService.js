import axios from 'axios';
//Ruta del API para el tipo de cambio (el API consume el web service de Hacienda)
const BASE_URL = import.meta.env.VITE_BASE_URL + 'exchangerate';

class ExchangeRateService {
  //Tipo de cambio del dólar del día: fecha, venta y compra
  //localhost/appbalancelegalcr/apibalancelegalcr/exchangerate
  getDollar() {
    return axios.get(BASE_URL);
  }
}

export default new ExchangeRateService();
