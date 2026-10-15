import axios from 'axios';
//Ruta del API para las reservas (citas)
const BASE_URL = import.meta.env.VITE_BASE_URL + 'appointment';

class AppointmentService {
  //Historial de reservas del encargado (el encargado lo define el API)
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment
  getAppointments() {
    return axios.get(BASE_URL);
  }
  //Obtener una reserva por su id
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/1
  getAppointmentById(AppointmentId) {
    return axios.get(BASE_URL + '/' + AppointmentId);
  }
}

export default new AppointmentService();
