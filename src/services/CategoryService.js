import axios from 'axios';
//ruta del API para las categorías de productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'category';

class CategoryService {
  //para el select del form de productos
  //localhost/appbalancelegalcr/apibalancelegalcr/category
  getCategories() {
    return axios.get(BASE_URL);
  }
}

export default new CategoryService();
