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
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BranchService from '../../services/BranchService';
import { SelectManagers } from './Form/SelectManagers';

export function CreateBranch() {
  const navigate = useNavigate();
  // Esquema de validación
  const branchSchema = yup.object({
    name: yup
      .string()
      .required('El nombre es requerido')
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre puede tener máximo 100 caracteres'),
    description: yup
      .string()
      .required('La descripción es requerida')
      .min(10, 'La descripción debe tener al menos 10 caracteres'),
    address: yup
      .string()
      .required('La dirección es requerida')
      .min(10, 'La dirección debe tener al menos 10 caracteres'),
    phone: yup
      .string()
      .required('El teléfono es requerido')
      .matches(/^\d{4}-\d{4}$/, 'El teléfono debe tener el formato 2222-3333'),
    email: yup.string().required('El correo es requerido').email('El correo no es válido'),
    //Relación de muchos: el valor es un arreglo con los ids de los encargados (puede ir vacío)
    managers: yup.array(),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      managers: [],
    },
    // Asignación de validaciones
    resolver: yupResolver(branchSchema),
  });

  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  // Accion submit
  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //Crear sucursal
      BranchService.createBranch(DataForm)
        .then((response) => {
          //Respuesta al usuario
          if (response.data != null) {
            toast.success(`Sucursal creada #${response.data.id} - ${response.data.name}`, {
              duration: 4000,
              position: 'top-center',
            });
            //Redirección a la tabla de sucursales
            return navigate('/branch-table');
          }
        })
        .catch((error) => {
          console.log(error);
          //Si el API manda un mensaje (por ejemplo, nombre repetido) se le muestra al usuario
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo crear la sucursal',
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  //Lista de encargados disponibles (los que no tienen sucursal)
  const [dataManagers, setDataManagers] = useState([]);
  const [loadedManagers, setLoadedManagers] = useState(false);
  useEffect(() => {
    BranchService.getAvailableManagers()
      .then((response) => {
        console.log(response);
        setDataManagers(response.data);
        setLoadedManagers(true);
      })
      .catch((error) => {
        //Si no hay encargados libres el API responde con error: la lista queda vacía
        console.log(error);
        setDataManagers([]);
        setLoadedManagers(true);
      });
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              Crear Sucursal
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="phone"
                    label="Teléfono"
                    placeholder="2222-3333"
                    error={Boolean(errors.phone)}
                    helperText={errors.phone ? errors.phone.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="email"
                    label="Correo"
                    error={Boolean(errors.email)}
                    helperText={errors.email ? errors.email.message : ' '}
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
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="address"
                    label="Dirección"
                    error={Boolean(errors.address)}
                    helperText={errors.address ? errors.address.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Lista de encargados */}
              {loadedManagers && (
                <Controller
                  name="managers"
                  control={control}
                  render={({ field }) => <SelectManagers field={field} data={dataManagers} />}
                />
              )}
              <FormHelperText>
                {dataManagers.length === 0 ? 'No hay encargados disponibles' : 'Puede escoger uno o varios encargados'}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/branch-table')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
