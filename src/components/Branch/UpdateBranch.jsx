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
import BranchService from '../../services/BranchService';
import { SelectManagers } from './Form/SelectManagers';

export function UpdateBranch() {
  const navigate = useNavigate();
  const routeParams = useParams();
  const id = routeParams.id || null;
  const [values, setValores] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (id != undefined && !isNaN(Number(id))) {
      BranchService.getBranchById(id)
        .then((response) => {
          console.log(response.data);
          //el select ocupa solo los ids de los encargados (igual que los géneros en UpdateMovie)
          setValores({
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            address: response.data.address,
            phone: response.data.phone,
            email: response.data.email,
            managers: response.data.managers.map((item) => item.id),
          });
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
  }, [id]);
  //validaciones
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
    //los encargados van en un arreglo de ids (puede ir vacío)
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
    values,
    resolver: yupResolver(branchSchema),
  });

  const onError = (errors, e) => console.log(errors, e);

  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //DataForm ya trae el id porque viene en values
      BranchService.updateBranch(DataForm)
        .then((response) => {
          if (response.data != null) {
            toast.success(`Sucursal actualizada #${response.data.id} - ${response.data.name}`, {
              duration: 4000,
              position: 'top-center',
            });
            return navigate('/branch-table');
          }
        })
        .catch((error) => {
          console.log(error);
          //si el API manda un mensaje (ej nombre repetido) se le enseña al usuario
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo actualizar la sucursal',
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  //encargados libres + los que ya son de esta sucursal
  const [dataManagers, setDataManagers] = useState([]);
  const [loadedManagers, setLoadedManagers] = useState(false);
  useEffect(() => {
    BranchService.getAvailableManagers(id)
      .then((response) => {
        console.log(response);
        setDataManagers(response.data);
        setLoadedManagers(true);
      })
      .catch((error) => {
        //si no hay encargados libres el API da error y la lista queda vacía
        console.log(error);
        setDataManagers([]);
        setLoadedManagers(true);
      });
  }, [id]);

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              Actualizar Sucursal
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
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
