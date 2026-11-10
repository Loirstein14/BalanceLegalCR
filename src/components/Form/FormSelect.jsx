import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

//Select de MUI conectado con react-hook-form.
//options viene como [{ value, label }]. Con multiple=true el valor es un arreglo
//(por ejemplo los encargados de una sucursal) y lo escogido se ve como chips
export function FormSelect({ name, control, label, options, multiple = false, required = false, emptyText = 'No hay opciones disponibles', ...rest }) {
  //Para sacar el texto de cada valor escogido (para los chips)
  const labelOf = (value) => options.find((o) => o.value === value)?.label ?? value;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? (multiple ? [] : '')}
          id={name}
          select
          label={label}
          required={required}
          fullWidth
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? ' '}
          slotProps={{
            select: {
              multiple,
              renderValue: multiple
                ? (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={labelOf(value)} size="small" />
                      ))}
                    </Box>
                  )
                : undefined,
            },
          }}
          {...rest}
        >
          {options.length === 0 && (
            <MenuItem value="" disabled>
              {emptyText}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}

FormSelect.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  multiple: PropTypes.bool,
  required: PropTypes.bool,
  emptyText: PropTypes.string,
};
