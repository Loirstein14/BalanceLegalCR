import axios from 'axios';
//Ruta del API para subir imágenes (igual que en el ejemplo del profe)
const BASE_URL = import.meta.env.VITE_BASE_URL + 'image';

class ImageService {
  //formData lleva: file (la imagen), type (product o service) e id
  createImage(formData) {
    return axios.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data;',
        Accept: 'multipart/form-data',
      },
    });
  }
}
export default new ImageService();
