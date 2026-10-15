import axios from 'axios';
//Ruta del API para las facturas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'invoice';

class InvoiceService {
  //Listado de facturas (más reciente primero)
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice
  getInvoices() {
    return axios.get(BASE_URL);
  }
  //Obtener una factura por su id
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice/1
  getInvoiceById(InvoiceId) {
    return axios.get(BASE_URL + '/' + InvoiceId);
  }
}

export default new InvoiceService();
