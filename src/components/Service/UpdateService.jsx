import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ServiceService from '../../services/ServiceService';
import ImageService from '../../services/ImageService';
import { SelectModality } from './Form/SelectModality';
import { SelectDuration } from './Form/SelectDuration';

export function UpdateService() {
  const navigate = useNavigate();
  const routeParams = useParams();
  //Id del servicio a actualizar
  const id = routeParams.id || null;
  //Url de las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  //Valores a precargar en el formulario, vienen del API
  const [values, setValores] = useState(null);
  //Obtener el servicio del API
  useEffect(() => {
    if (id != undefined && !isNaN(Number(id))) {
      ServiceService.getServiceById(id)
        .then((response) => {
          console.log(response.data);
          //Dar formato: solo los campos que gestiona el formulario
          setValores({
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            price: response.data.price,
            duration_minutes: response.data.duration_minutes,
            modality: response.data.modality,
            requirements: response.data.requirements ?? '',
          });
          //Si ya tiene imagen se muestra
          if (response.data.image_path) {
            setFileURL(`${BASE_URL}/${response.data.image_path}`);
          }
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
  }, [id, BASE_URL]);
  // Esquema de validación
  const serviceSchema = yup.object({
    name: yup
      .string()
      .required('El nombre es requerido')
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(120, 'El nombre puede tener máximo 120 caracteres'),
    description: yup
      .string()
      .required('La descripción es requerida')
      .min(10, 'La descripción debe tener al menos 10 caracteres'),
    price: yup
      .number()
      .typeError('Solo acepta números')
      .required('El precio es requerido')
      .positive('El precio debe ser mayor a 0'),
    duration_minutes: yup
      .number()
      .typeError('Seleccione la duración')
      .required('La duración es requerida')
      .oneOf([60, 120], 'La duración debe ser de 1 o 2 horas'),
    modality: yup.string().required('La modalidad es requerida'),
    requirements: yup.string().max(500, 'Los requisitos pueden tener máximo 500 caracteres'),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      modality: '',
      requirements: '',
    },
    //Valores a precargar en el formulario
    values,
    // Asignación de validaciones
    resolver: yupResolver(serviceSchema),
  });

  //Gestión de errores
  const [error, setError] = useState('');
  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  //Imagen escogida y su vista previa (igual que en MovieUploadImage)
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  function handleChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFileURL(URL.createObjectURL(e.target.files[0]));
      setFile(e.target.files[0]);
    }
  }
  //Si escogió otra imagen se sube después de guardar los datos
  const saveImage = (idService) => {
    if (!file) {
      return navigate('/service-table');
    }
    let formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'service');
    formData.append('id', idService);
    ImageService.createImage(formData)
      .then(() => navigate('/service-table'))
      .catch((error) => {
        console.log(error);
        //Los datos sí se guardaron, solo falló la imagen: se queda en el formulario para intentar de nuevo
        toast.error(typeof error.response?.data === 'string' ? error.response.data : 'No se pudo subir la imagen');
      });
  };

  // Accion submit
  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //Actualizar servicio (DataForm trae el id porque viene en values)
      ServiceService.updateService(DataForm)
        .then((response) => {
          //Respuesta al usuario
          if (response.data != null) {
            toast.success(`Servicio actualizado #${response.data.id} - ${response.data.name}`, {
              duration: 4000,
              position: 'top-center',
            });
            saveImage(response.data.id);
          }
        })
        .catch((error) => {
          console.log(error);
          //Si el API manda un mensaje (por ejemplo, nombre repetido) se le muestra al usuario
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo actualizar el servicio',
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              Actualizar Servicio
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Controlador y entrada de formulario name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="name"
                    label="Nombre"
                    error={Boolean(errors.name)}
                    helperText={errors.name ? errors.name.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="price"
                    label="Precio (₡)"
                    error={Boolean(errors.price)}
                    helperText={errors.price ? errors.price.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="description"
                    label="Descripción"
                    multiline
                    rows={3}
                    error={Boolean(errors.description)}
                    helperText={errors.description ? errors.description.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Lista de duraciones */}
              <Controller
                name="duration_minutes"
                control={control}
                render={({ field }) => <SelectDuration field={field} />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.duration_minutes ? errors.duration_minutes.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Lista de modalidades */}
              <Controller
                name="modality"
                control={control}
                render={({ field }) => <SelectModality field={field} />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.modality ? errors.modality.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="requirements"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="requirements"
                    label="Requisitos (opcional)"
                    multiline
                    rows={2}
                    error={Boolean(errors.requirements)}
                    helperText={errors.requirements ? errors.requirements.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            {/* Imagen (opcional): si escoge otra, reemplaza la que tiene */}
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Typography variant="subtitle1">Imagen (JPG, PNG o GIF, máximo 2 MB)</Typography>
              <input type="file" accept="image/*" onChange={handleChange} />
            </FormControl>
            {fileURL && <img src={fileURL} width={300} alt="Imagen del servicio" />}
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/service-table')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
