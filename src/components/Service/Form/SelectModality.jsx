import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectModality.propTypes = {
  field: PropTypes.object,
};
//Modalidad de atención: los valores son los mismos del ENUM de la BD
export function SelectModality({ field }) {
  return (
    <>
      <InputLabel id="modality">Modalidad</InputLabel>
      <Select {...field} labelId="modality" label="Modalidad" value={field.value}>
        <MenuItem value="in_person">Presencial</MenuItem>
        <MenuItem value="virtual">Virtual</MenuItem>
        <MenuItem value="home">A domicilio</MenuItem>
      </Select>
    </>
  );
}
