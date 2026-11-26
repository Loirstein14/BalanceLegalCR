import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectHour.propTypes = {
  field: PropTypes.object,
  id: PropTypes.string,
  label: PropTypes.string,
};
//horas completas de 6 a 22
const hours = [];
for (let h = 6; h <= 22; h++) {
  hours.push(String(h).padStart(2, '0') + ':00');
}
//horas para la hora inicial y la final
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
