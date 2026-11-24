import axios from 'axios';
//Ruta del API para las preguntas del formulario de reserva
const BASE_URL = import.meta.env.VITE_BASE_URL + 'question';

class QuestionService {
  //Preguntas activas del negocio, en orden
  //localhost/appbalancelegalcr/apibalancelegalcr/question
  getQuestions() {
    return axios.get(BASE_URL);
  }
}

export default new QuestionService();
