import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectManagers.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
//Lista de encargados (selección múltiple, igual que SelectGenres del profe)
//Solo vienen los encargados sin sucursal, y al modificar también los de esa sucursal
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
