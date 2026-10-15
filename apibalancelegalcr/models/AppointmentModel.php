<?php
class AppointmentModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect(); //Conectarse a la BD
    }
    //Obtener las reservas de la sucursal de un encargado (más reciente primero)
    //La sucursal sale del encargado: users.branch_id
    public function getByManager($idManager)
    {
        try {
            $vSql = "SELECT a.id, a.starts_at,
                            DATE_FORMAT(a.starts_at, '%d/%m/%Y') AS appointment_date,
                            CONCAT(DATE_FORMAT(a.starts_at, '%H:%i'), ' - ', DATE_FORMAT(a.ends_at, '%H:%i')) AS time_range,
                            CONCAT(c.first_name, ' ', c.last_name) AS client,
                            s.name AS service,
                            st.name AS status, st.color_hex AS status_color,
                            b.name AS branch
                     FROM appointments a, users m, users c, services s, appointment_statuses st, branches b
                     WHERE m.id = $idManager
                       AND a.branch_id = m.branch_id
                       AND a.branch_id = b.id
                       AND a.client_id = c.id
                       AND a.service_id = s.id
                       AND a.status_id = st.id
                     ORDER BY a.starts_at DESC;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Obtener una reserva por su id, con las preguntas y respuestas
    public function get($id)
    {
        try {
            $answerM = new AppointmentAnswerModel(); //Instanciar el modelo de respuestas
            $vSql = "SELECT a.id,
                            DATE_FORMAT(a.created_at, '%d/%m/%Y %H:%i') AS created_date,
                            DATE_FORMAT(a.starts_at, '%d/%m/%Y') AS appointment_date,
                            CONCAT(DATE_FORMAT(a.starts_at, '%H:%i'), ' - ', DATE_FORMAT(a.ends_at, '%H:%i')) AS time_range,
                            b.name AS branch,
                            s.name AS service,
                            p.display_name AS provider,
                            CONCAT(c.first_name, ' ', c.last_name) AS client,
                            st.name AS status, st.color_hex AS status_color,
                            a.cancellation_reason
                     FROM appointments a, branches b, services s, providers p, users c, appointment_statuses st
                     WHERE a.branch_id = b.id
                       AND a.service_id = s.id
                       AND a.provider_id = p.id
                       AND a.client_id = c.id
                       AND a.status_id = st.id
                       AND a.id = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                $vResultado = $vResultado[0];
                //Preguntas y respuestas --answers
                $vResultado->answers = $answerM->getByAppointment($vResultado->id);
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
