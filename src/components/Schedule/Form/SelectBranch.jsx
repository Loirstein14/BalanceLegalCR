import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectBranch.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
//Lista de sucursales (se usa en horarios y en bloqueos)
export function SelectBranch({ field, data }) {
  return (
    <>
      <InputLabel id="branch">Sucursal</InputLabel>
      <Select {...field} labelId="branch" label="Sucursal" value={field.value}>
        {data &&
          data.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
