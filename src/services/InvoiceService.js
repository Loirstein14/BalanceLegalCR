import axios from 'axios';
//ruta del API para las facturas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'invoice';

class InvoiceService {
  //facturas de la sucursal del encargado, la más nueva primero
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice
  getInvoices() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice/1
  getInvoiceById(InvoiceId) {
    return axios.get(BASE_URL + '/' + InvoiceId);
  }
  //encabezado: encargado, sucursal y % de impuesto
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice/header
  getHeader() {
    return axios.get(BASE_URL + '/header');
  }
  //crear factura, los totales los calcula el API con los precios de la BD
  createInvoice(Invoice) {
    return axios.post(BASE_URL, JSON.stringify(Invoice));
  }
  //facturar una proforma, el id va dentro del objeto con las líneas
  issueProforma(Invoice) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Invoice),
    });
  }
}

export default new InvoiceService();
