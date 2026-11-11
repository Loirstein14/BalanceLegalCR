import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectDeliveryFormat.propTypes = {
  field: PropTypes.object,
};
//Formato de entrega: los valores son los mismos del ENUM de la BD
export function SelectDeliveryFormat({ field }) {
  return (
    <>
      <InputLabel id="delivery_format">Formato de entrega</InputLabel>
      <Select {...field} labelId="delivery_format" label="Formato de entrega" value={field.value}>
        <MenuItem value="physical">Físico</MenuItem>
        <MenuItem value="digital">Digital</MenuItem>
      </Select>
    </>
  );
}
