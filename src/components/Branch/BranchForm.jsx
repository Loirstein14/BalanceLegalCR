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
import BranchService from '../../services/BranchService';
import { FormTextField } from '../Form/FormTextField';
import { FormSelect } from '../Form/FormSelect';
import { handleApiError } from '../../utils/apiErrors';

//Validaciones del formulario (las mismas que revisa la API)
const branchSchema = yup.object({
  name: yup.string().trim().required().min(3).max(100).label('Nombre'),
  description: yup.string().trim().required().min(10).max(500).label('Descripción'),
  address: yup.string().trim().required().min(10).max(255).label('Dirección'),
  phone: yup
    .string()
    .trim()
    .required()
    .matches(/^\d{4}-\d{4}$/, 'Teléfono debe tener el formato 2222-3333')
    .label('Teléfono'),
  email: yup.string().trim().required().email().max(254).label('Correo'),
  managers: yup.array().of(yup.number()).label('encargados'), //Puede quedar sin encargados por ahora
});

//Valores con los que arranca el formulario vacío
const emptyBranch = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  managers: [],
};

//El mismo formulario sirve para CREAR (/branch/create) y MODIFICAR (/branch/update/:id).
//Si la ruta trae id, se carga la sucursal y se guarda con PUT; si no, se crea con POST
export function BranchForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [managerOptions, setManagerOptions] = useState([]); //Encargados que se pueden escoger
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: emptyBranch,
    resolver: yupResolver(branchSchema),
  });

  //Traer los encargados disponibles y, si es modificar, también la sucursal para llenar el form
  useEffect(() => {
    const requests = [BranchService.getAvailableManagers(id)];
    if (isEdit) requests.push(BranchService.getBranchById(id));
    Promise.all(requests)
      .then(([managersResponse, branchResponse]) => {
        setManagerOptions(managersResponse.data.map((m) => ({ value: m.id, label: m.name })));
        if (branchResponse) {
          const b = branchResponse.data;
          reset({
            name: b.name,
            description: b.description ?? '',
            address: b.address ?? '',
            phone: b.phone ?? '',
            email: b.email ?? '',
            managers: b.managers.map((m) => m.id), //Los que ya tiene salen marcados
          });
        }
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setLoadError(isEdit ? 'No se encontró la sucursal' : 'No se pudieron cargar los encargados');
        setLoaded(true);
      });
  }, [id, isEdit, reset]);

  //Guardar en JSON (POST o PUT); los encargados van como un arreglo de ids
  const onSubmit = async (values) => {
    try {
      const response = isEdit
        ? await BranchService.updateBranch({ ...values, id: Number(id) })
        : await BranchService.createBranch(values);
      toast.success(isEdit ? 'Sucursal modificada correctamente' : 'Sucursal creada correctamente');
      navigate(`/branch/${response.data.id}`, { replace: true }); //replace: para que 'Regresar' no vuelva al form
    } catch (error) {
      handleApiError(error, setError); //Los errores de la API salen debajo de cada campo
    }
  };

  if (!loaded) return <p>Cargando...</p>;
  if (loadError) return <p>Error: {loadError}</p>;

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEdit ? 'Modificar sucursal' : 'Crear sucursal'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Los campos con * son obligatorios.
      </Typography>
      {/* noValidate: para que valide Yup y no el navegador */}
      <form noValidate onSubmit={handleSubmit(onSubmit, () => toast.error('Revise los campos marcados'))}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <FormTextField name="name" control={control} label="Nombre" required />
          </Grid>
          <Grid size={12}>
            <FormTextField name="description" control={control} label="Descripción" required multiline rows={3} />
          </Grid>
          <Grid size={12}>
            <FormTextField name="address" control={control} label="Dirección" required />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="phone" control={control} label="Teléfono" type="tel" required placeholder="2222-3333" />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <FormTextField name="email" control={control} label="Correo" type="email" required />
          </Grid>
          <Grid size={12}>
            {/* Solo salen los encargados sin sucursal (y los de esta sucursal si se está modificando) */}
            <FormSelect
              name="managers"
              control={control}
              label="Encargados"
              options={managerOptions}
              multiple
              emptyText="No hay encargados disponibles"
            />
          </Grid>
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/branch-table')}>
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
