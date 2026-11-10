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
  //Crear un producto (POST, se manda en JSON)
  createProduct(product) {
    return axios.post(BASE_URL, product);
  }
  //Modificar un producto (PUT, el id va dentro del objeto)
  updateProduct(product) {
    return axios.put(BASE_URL, product);
  }
  //Subir la imagen del producto (POST con form-data: id e image)
  //localhost/appbalancelegalcr/apibalancelegalcr/product/image
  uploadImage(productId, file) {
    const formData = new FormData();
    formData.append('id', productId);
    formData.append('image', file);
    return axios.post(BASE_URL + '/image', formData);
  }
}

export default new ProductService();