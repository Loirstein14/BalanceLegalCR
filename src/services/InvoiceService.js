import axios from 'axios';
//ruta del API para las facturas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'invoice';

class InvoiceService {
  //facturas de la sucursal del encargado
  getInvoices() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice/1
  getInvoiceById(InvoiceId) {
    return axios.get(BASE_URL + '/' + InvoiceId);
  }
  //encabezado de la factura
  getHeader() {
    return axios.get(BASE_URL + '/header');
  }
  //crear factura
  createInvoice(Invoice) {
    return axios.post(BASE_URL, JSON.stringify(Invoice));
  }
  //guardar o facturar una proforma
  issueProforma(Invoice) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Invoice),
    });
  }
  //anular una factura facturada
  cancelInvoice(Invoice) {
    return axios({
      method: 'put',
      url: BASE_URL + '/cancel',
      data: JSON.stringify(Invoice),
    });
  }
}

export default new InvoiceService();
