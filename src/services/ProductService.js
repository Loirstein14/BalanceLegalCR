import axios from 'axios';
//ruta del API para los productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'product';

class ProductService {
  //localhost/appbalancelegalcr/apibalancelegalcr/product
  getProducts() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/product/1
  getProductById(ProductId) {
    return axios.get(BASE_URL + '/' + ProductId);
  }
  createProduct(Product) {
    return axios.post(BASE_URL, JSON.stringify(Product));
  }
  //el id va dentro del objeto
  updateProduct(Product) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Product),
    });
  }
}
export default new ProductService();
