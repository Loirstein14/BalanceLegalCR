import axios from 'axios';
//ruta del API para las categorías de productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'category';

class CategoryService {
  //categorías para el select de productos
  getCategories() {
    return axios.get(BASE_URL);
  }
}

export default new CategoryService();
