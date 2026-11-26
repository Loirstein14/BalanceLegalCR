import axios from 'axios';
//ruta del API para las reservas
const BASE_URL = import.meta.env.VITE_BASE_URL + 'appointment';

class AppointmentService {
  //historial del encargado (el encargado lo pone el API)
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment
  getAppointments() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/1
  getAppointmentById(AppointmentId) {
    return axios.get(BASE_URL + '/' + AppointmentId);
  }
  //encargado y su sucursal
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/manager
  getManager() {
    return axios.get(BASE_URL + '/manager');
  }
  //horas libres de un servicio en una fecha (aaaa-mm-dd)
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/availableHours/2026-11-25/1
  getAvailableHours(date, ServiceId) {
    return axios.get(BASE_URL + '/availableHours/' + date + '/' + ServiceId);
  }
  //estado con el que queda la reserva nueva, nombre y color
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/initialStatus
  getInitialStatus() {
    return axios.get(BASE_URL + '/initialStatus');
  }
  //crear reserva, el API también guarda las respuestas y la proforma
  createAppointment(Appointment) {
    return axios.post(BASE_URL, JSON.stringify(Appointment));
  }
}

export default new AppointmentService();
