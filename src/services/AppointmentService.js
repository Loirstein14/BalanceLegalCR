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
  //Encargado fijo y su sucursal (los define el API)
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/manager
  getManager() {
    return axios.get(BASE_URL + '/manager');
  }
  //Horas disponibles de un servicio en una fecha (fecha en formato aaaa-mm-dd)
  //localhost/appbalancelegalcr/apibalancelegalcr/appointment/availableHours/2026-11-25/1
  getAvailableHours(date, ServiceId) {
    return axios.get(BASE_URL + '/availableHours/' + date + '/' + ServiceId);
  }
}

export default new AppointmentService();
