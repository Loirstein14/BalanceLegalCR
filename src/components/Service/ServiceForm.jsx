import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ServiceService from '../../services/ServiceService';
import { FormTextField } from '../Form/FormTextField';
import { FormSelect } from '../Form/FormSelect';
import { FormImageInput } from '../Form/FormImageInput';
import { numberField, imageField } from '../../utils/yupHelpers';
import { handleApiError } from '../../utils/apiErrors';
import { MODALITY_OPTIONS, DURATION_OPTIONS } from '../../utils/serviceOptions';

//Validaciones del formulario (las mismas que revisa la API)
const serviceSchema = yup.object({
  name: yup.string().trim().required().min(3).max(120).label('Nombre'),
  description: yup.string().trim().required().min(10).max(1000).label('Descripción'),
  price: numberField('Precio').required().min(1).max(9999999),
  duration_minutes: yup
    .number()
    .typeError('Duración es requerida')
    .required()
    .oneOf(DURATION_OPTIONS.map((o) => o.value))
    .label('Duración'),
  //El select solo trae valores válidos, igual la API revisa que sea uno permitido
  modality: yup.string().required('Modalidad es requerida').label('Modalidad'),
  requirements: yup.string().trim().max(500).label('Requisitos'),
  image: imageField(false), //No es obligatoria; si viene tiene que ser JPG/PNG/WEBP y máximo 2 MB
});

//Valores con los que arranca el formulario vacío
const emptyService = {
  name: '',
  description: '',
  price: '',
  duration_minutes: '',
  modality: '',
  requirements: '',
  image: null,
};

//El mismo formulario sirve para CREAR (/service/create) y MODIFICAR (/service/update/:id).
//Si la ruta trae id, se carga el servicio y se guarda con PUT; si no, se crea con POST
export function ServiceForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const IMG_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [currentImage, setCurrentImage] = useState(null); //La imagen que ya tiene (solo cuando se modifica)
  const [loaded, setLoaded] = useState(!isEdit);
  const [loadError, setLoadError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: emptyService,
    resolver: yupResolver(serviceSchema),
  });

  //Si es modificar: traer el servicio y llenar el form con sus datos
  useEffect(() => {
    if (!isEdit) return;
    ServiceService.getServiceById(id)
      .then((response) => {
        const s = response.data;
        reset({
          name: s.name,
          description: s.description ?? '',
          price: s.price,
          duration_minutes: s.duration_minutes,
          modality: s.modality,
          requirements: s.requirements ?? '',
          image: null,
        });
        setCurrentImage(s.image_path ? `${IMG_URL}/${s.image_path}` : null);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setLoadError('No se encontró el servicio');
        setLoaded(true);
      });
  }, [id, isEdit, reset, IMG_URL]);

  //Guardar: 1) los datos en JSON (POST o PUT)  2) la imagen aparte, si escogieron una
  const onSubmit = async (values) => {
    const { image, ...service } = values;
    let saved;
    try {
      const response = isEdit
        ? await ServiceService.updateService({ ...service, id: Number(id) })
        : await ServiceService.createService(service);
      saved = response.data;
    } catch (error) {
      handleApiError(error, setError); //Los errores de la API salen debajo de cada campo
      return;
    }
    if (image instanceof File) {
      try {
        await ServiceService.uploadImage(saved.id, image);
      } catch (error) {
        //Los datos sí se guardaron, solo falló la imagen: se manda a modificar para volver a intentar
        handleApiError(error, setError);
        toast.error('El servicio se guardó, pero la imagen no. Intente subirla de nuevo.');
        navigate(`/service/update/${saved.id}`);
        return;
      }
    }
    toast.success(isEdit ? 'Servicio modificado correctamente' : 'Servicio creado correctamente');
    navigate(`/service/${saved.id}`);
  };

  if (!loaded) return <p>Cargando...</p>;
  if (loadError) return <p>Error: {loadError}</p>;

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEdit ? 'Modificar servicio' : 'Crear servicio'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Los campos con * son obligatorios.
      </Typography>
      {/* noValidate: para que valide Yup y no el navegador */}
      <form noValidate onSubmit={handleSubmit(onSubmit, () => toast.error('Revise los campos marcados'))}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <FormTextField name="name" control={control} label="Nombre" required />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="price" control={control} label="Precio (₡)" type="number" required htmlInput={{ min: 1, step: 500 }} />
          </Grid>
          <Grid size={12}>
            <FormTextField name="description" control={control} label="Descripción" required multiline rows={3} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect name="duration_minutes" control={control} label="Duración" options={DURATION_OPTIONS} required />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect name="modality" control={control} label="Modalidad" options={MODALITY_OPTIONS} required />
          </Grid>
          <Grid size={12}>
            <FormTextField name="requirements" control={control} label="Requisitos (documentos que debe traer el cliente)" multiline rows={2} />
          </Grid>
          <Grid size={12}>
            <FormImageInput name="image" control={control} currentImageUrl={currentImage} />
          </Grid>
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/service-table')}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
