import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectCategory.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
//Lista de categorías (vienen de la BD)
export function SelectCategory({ field, data }) {
  return (
    <>
      <InputLabel id="category">Categoría</InputLabel>
      <Select {...field} labelId="category" label="Categoría" value={field.value}>
        {data &&
          data.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
