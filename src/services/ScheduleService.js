import axios from 'axios';
//ruta del API para los horarios
const BASE_URL = import.meta.env.VITE_BASE_URL + 'schedule';

class ScheduleService {
  //localhost/appbalancelegalcr/apibalancelegalcr/schedule
  getSchedules() {
    return axios.get(BASE_URL);
  }
  //localhost/appbalancelegalcr/apibalancelegalcr/schedule/1
  getScheduleById(ScheduleId) {
    return axios.get(BASE_URL + '/' + ScheduleId);
  }
  //horarios de una sucursal
  //localhost/appbalancelegalcr/apibalancelegalcr/schedule/getByBranch/1
  getSchedulesByBranch(BranchId) {
    return axios.get(BASE_URL + '/getByBranch/' + BranchId);
  }
  //crear, llega un rango y el API crea uno por día
  createSchedule(Schedule) {
    return axios.post(BASE_URL, JSON.stringify(Schedule));
  }
  //el id va dentro del objeto
  updateSchedule(Schedule) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Schedule),
    });
  }
}
export default new ScheduleService();
