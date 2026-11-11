import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectDuration.propTypes = {
  field: PropTypes.object,
};
//Duración del servicio: bloques de 1 o 2 horas (como lo pidió el profe), se guarda en minutos
export function SelectDuration({ field }) {
  return (
    <>
      <InputLabel id="duration_minutes">Duración</InputLabel>
      <Select {...field} labelId="duration_minutes" label="Duración" value={field.value}>
        <MenuItem value={60}>1 hora</MenuItem>
        <MenuItem value={120}>2 horas</MenuItem>
      </Select>
    </>
  );
}
