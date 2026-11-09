import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

//Campo de texto de MUI conectado a react-hook-form.
//Muestra el mensaje de error de Yup (o de la API) debajo del campo.
//type: text | number | email | tel | date | time
export function FormTextField({ name, control, label, type = 'text', required = false, multiline = false, rows, htmlInput, ...rest }) {
  //Las fechas y horas siempre muestran la etiqueta arriba (si no se monta sobre el dd/mm/aaaa)
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
          //Espacio en blanco para que el formulario no "salte" al aparecer un error
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
