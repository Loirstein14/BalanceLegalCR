import axios from 'axios';
//Ruta del API para las facturas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'invoice';

class InvoiceService {
  //Facturas de la sucursal del encargado (más reciente primero)
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice
  getInvoices() {
    return axios.get(BASE_URL);
  }
  //Obtener una factura por su id
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice/1
  getInvoiceById(InvoiceId) {
    return axios.get(BASE_URL + '/' + InvoiceId);
  }
  //Encabezado de la factura: encargado, sucursal y % de impuesto
  //localhost/appbalancelegalcr/apibalancelegalcr/invoice/header
  getHeader() {
    return axios.get(BASE_URL + '/header');
  }
  //Crear factura (el API calcula los totales con los precios de la BD)
  createInvoice(Invoice) {
    return axios.post(BASE_URL, JSON.stringify(Invoice));
  }
}

export default new InvoiceService();
