import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectAvailableHour.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
  disabled: PropTypes.bool,
};
//horas libres que calcula el API
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
