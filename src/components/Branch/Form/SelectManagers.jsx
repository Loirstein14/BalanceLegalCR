import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectManagers.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
//encargados, selección múltiple igual que SelectGenres del profe
//vienen los que no tienen sucursal y al editar también los de esa sucursal
export function SelectManagers({ field, data }) {
  return (
    <>
      <InputLabel id="managers">Encargados</InputLabel>
      <Select {...field} labelId="managers" label="Encargados" multiple value={field.value}>
        {data &&
          data.map((manager) => (
            <MenuItem key={manager.id} value={manager.id}>
              {manager.name}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
