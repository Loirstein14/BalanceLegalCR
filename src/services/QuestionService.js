import axios from 'axios';
//ruta del API para las preguntas de la reserva
const BASE_URL = import.meta.env.VITE_BASE_URL + 'question';

class QuestionService {
  //preguntas de la reserva
  getQuestions() {
    return axios.get(BASE_URL);
  }
}

export default new QuestionService();
