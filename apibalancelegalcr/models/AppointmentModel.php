<?php
class AppointmentModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //reservas de la sucursal del encargado
    public function getByManager($idManager)
    {
        try {
            //client_id y starts_at los ocupa react para los filtros
            $vSql = "SELECT a.id, a.starts_at, a.client_id,
                            DATE_FORMAT(a.starts_at, '%d/%m/%Y') AS appointment_date,
                            CONCAT(DATE_FORMAT(a.starts_at, '%H:%i'), ' - ', DATE_FORMAT(a.ends_at, '%H:%i')) AS time_range,
                            CONCAT(c.first_name, ' ', c.last_name) AS client,
                            s.name AS service,
                            st.name AS status, st.color_hex AS status_color,
                            b.name AS branch
                     FROM appointments a, users m, users c, services s, appointment_statuses st, branches b
                     WHERE m.id = ?
                       AND a.branch_id = m.branch_id
                       AND a.branch_id = b.id
                       AND a.client_id = c.id
                       AND a.service_id = s.id
                       AND a.status_id = st.id
                     ORDER BY a.starts_at DESC;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idManager]);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //una reserva por id con sus preguntas y respuestas
    public function get($id)
    {
        try {
            $answerM = new AppointmentAnswerModel();
            $vSql = "SELECT a.id,
                            DATE_FORMAT(a.created_at, '%d/%m/%Y %H:%i') AS created_date,
                            DATE_FORMAT(a.starts_at, '%d/%m/%Y') AS appointment_date,
                            CONCAT(DATE_FORMAT(a.starts_at, '%H:%i'), ' - ', DATE_FORMAT(a.ends_at, '%H:%i')) AS time_range,
                            b.name AS branch,
                            s.name AS service,
                            p.display_name AS provider,
                            CONCAT(c.first_name, ' ', c.last_name) AS client,
                            c.email AS client_email,
                            st.name AS status, st.color_hex AS status_color,
                            a.cancellation_reason
                     FROM appointments a, branches b, services s, providers p, users c, appointment_statuses st
                     WHERE a.branch_id = b.id
                       AND a.service_id = s.id
                       AND a.provider_id = p.id
                       AND a.client_id = c.id
                       AND a.status_id = st.id
                       AND a.id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$id]);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                //preguntas y respuestas --answers
                $vResultado->answers = $answerM->getByAppointment($vResultado->id);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //horas libres donde cabe el servicio completo
    public function availableHours($idBranch, $date, $idService)
    {
        try {
            //fecha y hora de MySQL
            $vSql = "SELECT CURDATE() AS today, CURTIME() AS now_time;";
            $now = $this->enlace->ExecuteSQL($vSql)[0];
            if ($date < $now->today) {
                return [];
            }
            //duración del servicio si la sucursal lo da
            $vSql = "SELECT s.duration_minutes
                     FROM services s, branch_services bs
                     WHERE bs.service_id = s.id
                       AND bs.branch_id = ?
                       AND s.id = ?
                       AND s.is_active = 1;";
            $service = $this->enlace->ExecuteSQL($vSql, [$idBranch, $idService]);
            if (empty($service)) {
                return [];
            }
            $duration = $service[0]->duration_minutes;
            //horario de ese día
            $vSql = "SELECT start_time, end_time
                     FROM branch_schedules
                     WHERE branch_id = ? AND schedule_date = ?
                     ORDER BY start_time;";
            $schedules = $this->enlace->ExecuteSQL($vSql, [$idBranch, $date]);
            //si ese día no abre no hay horas
            if (empty($schedules)) {
                return [];
            }
            //lo ocupado ese día sin canceladas ni no asistió
            $vSql = "SELECT start_time, end_time
                     FROM schedule_blocks
                     WHERE branch_id = ? AND block_date = ?
                     UNION ALL
                     SELECT TIME(starts_at), TIME(ends_at)
                     FROM appointments
                     WHERE branch_id = ? AND DATE(starts_at) = ? AND status_id NOT IN (5, 6);";
            $busy = $this->enlace->ExecuteSQL($vSql, [$idBranch, $date, $idBranch, $date]);
            if (empty($busy)) {
                $busy = [];
            }

            $hours = [];
            foreach ($schedules as $schedule) {
                $start = $this->toMinutes($schedule->start_time);
                $end = $this->toMinutes($schedule->end_time);
                //una opción cada hora mientras quepa el servicio
                for ($hour = $start; $hour + $duration <= $end; $hour += 60) {
                    $free = true;
                    //si es hoy la hora tiene que ser después de ahora
                    if ($date == $now->today && $hour <= $this->toMinutes($now->now_time)) {
                        $free = false;
                    }
                    //misma regla de traslape del avance 4
                    foreach ($busy as $range) {
                        if ($hour < $this->toMinutes($range->end_time)
                            && $hour + $duration > $this->toMinutes($range->start_time)) {
                            $free = false;
                        }
                    }
                    if ($free) {
                        $hours[] = (object) [
                            'start_time' => $this->toTime($hour),
                            'end_time' => $this->toTime($hour + $duration),
                            'label' => $this->toTime($hour) . ' - ' . $this->toTime($hour + $duration),
                        ];
                    }
                }
            }
            return $hours;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //un estado con su color
    public function getStatus($idStatus)
    {
        try {
            $vSql = "SELECT id, name, color_hex FROM appointment_statuses WHERE id = ?;";
            $vResultado = $this->enlace->ExecuteSQL($vSql, [$idStatus]);
            if (!empty($vResultado)) {
                return $vResultado[0];
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //crear la cita sus respuestas y la proforma
    public function create($objeto, $manager, $idStatus)
    {
        try {
            $serviceM = new ServiceModel();
            $answerM = new AppointmentAnswerModel();
            $invoiceM = new InvoiceModel();
            //de aquí sale la duración y el precio para la proforma
            $service = $serviceM->get($objeto->service_id);
            //MySQL calcula la hora final con la duración
            $sql = "INSERT INTO appointments
                        (client_id, provider_id, branch_id, service_id, status_id, starts_at, ends_at, created_by)
                    VALUES (?, ?, ?, ?, ?, TIMESTAMP(?, ?), DATE_ADD(TIMESTAMP(?, ?), INTERVAL ? MINUTE), ?);";
            $idAppointment = $this->enlace->executeSQL_DML_last($sql, [
                $objeto->client_id,
                $manager->provider_id,
                $manager->branch_id,
                $objeto->service_id,
                $idStatus,
                $objeto->date, $objeto->start_time,
                $objeto->date, $objeto->start_time,
                $service->duration_minutes,
                $manager->id,
            ]);
            foreach ($objeto->answers as $answer) {
                $answerM->create($idAppointment, $answer->question_id, $answer->answer_text);
            }
            //proforma de la reserva
            $idInvoice = $invoiceM->createProforma($idAppointment, $objeto->client_id, $manager->branch_id, $service);
            //se devuelve la reserva con el id de su proforma
            $appointment = $this->get($idAppointment);
            $appointment->invoice_id = $idInvoice;
            return $appointment;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //pasa la hora a minutos para poder sumar
    private function toMinutes($time)
    {
        $parts = explode(':', $time);
        return (int) $parts[0] * 60 + (int) $parts[1];
    }
    //pasa los minutos a hora
    private function toTime($minutes)
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }
}
