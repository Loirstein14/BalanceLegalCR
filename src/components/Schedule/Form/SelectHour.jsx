import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectHour.propTypes = {
  field: PropTypes.object,
  id: PropTypes.string,
  label: PropTypes.string,
};
//Horas completas de 06:00 a 22:00 (como dijo el profe: nada de medias horas)
const hours = [];
for (let h = 6; h <= 22; h++) {
  hours.push(String(h).padStart(2, '0') + ':00');
}
//Lista de horas (se usa para la hora inicial y la final)
export function SelectHour({ field, id, label }) {
  return (
    <>
      <InputLabel id={id}>{label}</InputLabel>
      <Select {...field} labelId={id} label={label} value={field.value}>
        {hours.map((hour) => (
          <MenuItem key={hour} value={hour}>
            {hour}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
