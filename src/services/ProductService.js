import axios from 'axios';
//Ruta del API para los productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'product';

class ProductService {
  //Listado de productos
  //localhost/appbalancelegalcr/apibalancelegalcr/product
  getProducts() {
    return axios.get(BASE_URL);
  }
  //Obtener un producto por su id
  //localhost/appbalancelegalcr/apibalancelegalcr/product/1
  getProductById(ProductId) {
    return axios.get(BASE_URL + '/' + ProductId);
  }
}

export default new ProductService();