import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

//Vista previa: la imagen nueva elegida o, si no hay, la imagen actual del registro
function ImagePreview({ file, currentImageUrl }) {
  //URL temporal del archivo local elegido
  const preview = useMemo(() => (file instanceof File ? URL.createObjectURL(file) : null), [file]);
  //Liberar la URL temporal al cambiar de archivo o salir del formulario
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const src = preview ?? currentImageUrl;
  if (!src) {
    return (
      <Box sx={{ width: 160, height: 160, border: '1px dashed', borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sin imagen</Typography>
      </Box>
    );
  }
  return <Box component="img" src={src} alt="Vista previa" sx={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 1, boxShadow: 1 }} />;
}

ImagePreview.propTypes = {
  file: PropTypes.any,
  currentImageUrl: PropTypes.string,
};

//Selector de imagen conectado a react-hook-form.
//El valor del campo es el objeto File elegido (o null si no se cambia la imagen).
export function FormImageInput({ name, control, label = 'Imagen', currentImageUrl }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ImagePreview file={field.value} currentImageUrl={currentImageUrl} />
          <Box>
            <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
              {currentImageUrl || field.value ? `Cambiar ${label.toLowerCase()}` : `Seleccionar ${label.toLowerCase()}`}
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
              />
            </Button>
            <FormHelperText>{field.value instanceof File ? field.value.name : 'JPG, PNG o WEBP, máximo 2 MB'}</FormHelperText>
            {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
          </Box>
        </Box>
      )}
    />
  );
}

FormImageInput.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  label: PropTypes.string,
  currentImageUrl: PropTypes.string,
};
