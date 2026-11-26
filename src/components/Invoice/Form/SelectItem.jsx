import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ListSubheader from '@mui/material/ListSubheader';
import PropTypes from 'prop-types';

SelectItem.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
  used: PropTypes.array,
  error: PropTypes.bool,
};
//producto o servicio de una línea, agrupados en servicios y productos
//el valor es una clave con el tipo y el id: 'S-1' (servicio 1) o 'P-3' (producto 3)
//los que ya están en otra línea salen deshabilitados
export function SelectItem({ field, data, used, error }) {
  const services = data.filter((item) => item.type === 'S');
  const products = data.filter((item) => item.type === 'P');
  const option = (item) => (
    <MenuItem
      key={item.key}
      value={item.key}
      disabled={used.includes(item.key) && item.key !== field.value}
    >
      {item.name}
    </MenuItem>
  );
  return (
    <Select {...field} value={field.value} displayEmpty size="small" fullWidth error={error}>
      <MenuItem value="" disabled>
        Seleccione...
      </MenuItem>
      {/* MUI pide que los encabezados y opciones vayan sueltos en el Select, sin <>...</> */}
      <ListSubheader>Servicios</ListSubheader>
      {services.map(option)}
      <ListSubheader>Productos</ListSubheader>
      {products.map(option)}
    </Select>
  );
}
