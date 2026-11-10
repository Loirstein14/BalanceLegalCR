import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

//TextField de MUI conectado con react-hook-form.
//Si hay error (de Yup o de la API) lo pone debajo del campo.
//type puede ser: text, number, email, tel, date o time
export function FormTextField({ name, control, label, type = 'text', required = false, multiline = false, rows, htmlInput, ...rest }) {
  //En fechas y horas la etiqueta va arriba siempre, si no se monta encima del dd/mm/aaaa
  const shrink = type === 'date' || type === 'time' ? { shrink: true } : undefined;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          id={name}
          label={label}
          type={type}
          required={required}
          multiline={multiline}
          rows={rows}
          fullWidth
          error={Boolean(fieldState.error)}
          //El espacio en blanco es para que el form no brinque cuando sale un error
          helperText={fieldState.error?.message ?? ' '}
          slotProps={{ inputLabel: shrink, htmlInput }}
          {...rest}
        />
      )}
    />
  );
}

FormTextField.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  htmlInput: PropTypes.object,
};
