import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectAvailableHour.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
  disabled: PropTypes.bool,
};
//Horas disponibles que calcula el API (ya respetan la duración, el horario, los bloqueos y las otras citas)
//Se guarda la hora de inicio y se muestra el rango completo, por ejemplo "10:00 - 12:00"
export function SelectAvailableHour({ field, data, disabled }) {
  return (
    <>
      <InputLabel id="start_time">Hora</InputLabel>
      <Select {...field} labelId="start_time" label="Hora" value={field.value} disabled={disabled}>
        {data &&
          data.map((hour) => (
            <MenuItem key={hour.start_time} value={hour.start_time}>
              {hour.label}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
