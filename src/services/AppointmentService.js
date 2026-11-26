import axios from 'axios';
//ruta del API para las reservas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'appointment';

class AppointmentService {
  //historial del encargado
  getAppointments() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/1
  getAppointmentById(AppointmentId) {
    return axios.get(BASE_URL + '/' + AppointmentId);
  }
  //encargado y su sucursal
  getManager() {
    return axios.get(BASE_URL + '/manager');
  }
  //horas libres de un servicio en una fecha
  getAvailableHours(date, ServiceId) {
    return axios.get(BASE_URL + '/availableHours/' + date + '/' + ServiceId);
  }
  //estado inicial de la reserva
  getInitialStatus() {
    return axios.get(BASE_URL + '/initialStatus');
  }
  //crear reserva con respuestas y proforma
  createAppointment(Appointment) {
    return axios.post(BASE_URL, JSON.stringify(Appointment));
  }
}

export default new AppointmentService();
