import axios from 'axios';
//Ruta del API para las categorías de productos
const BASE_URL = import.meta.env.VITE_BASE_URL + 'category';

class CategoryService {
  //Listado de categorías (para el select del formulario de productos)
  //localhost/appbalancelegalcr/apibalancelegalcr/category
  getCategories() {
    return axios.get(BASE_URL);
  }
}

export default new CategoryService();
