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
import BlockService from '../../services/BlockService';
import BranchService from '../../services/BranchService';
import { SelectBranch } from '../Schedule/Form/SelectBranch';
import { SelectHour } from '../Schedule/Form/SelectHour';

export function CreateBlock() {
  const navigate = useNavigate();
  //Fecha de hoy en formato aaaa-mm-dd (el mismo formato del input de fecha)
  const today = new Date().toLocaleDateString('en-CA');
  // Esquema de validación
  const blockSchema = yup.object({
    branch_id: yup
      .number()
      .typeError('Seleccione una sucursal')
      .required('La sucursal es requerida'),
    block_date: yup
      .string()
      .required('La fecha es requerida')
      //Validador propio (.test): la fecha no puede ser anterior a hoy
      .test('fecha-no-pasada', 'La fecha no puede ser anterior a hoy', (value) => !value || value >= today),
    start_time: yup.string().required('La hora inicial es requerida'),
    end_time: yup
      .string()
      .required('La hora final es requerida')
      //this.parent son los demás campos del formulario: se compara con la hora inicial
      .test('hora-final', 'La hora final debe ser mayor a la hora inicial', function (value) {
        return !value || !this.parent.start_time || value > this.parent.start_time;
      }),
    reason: yup.string().max(150, 'El motivo puede tener máximo 150 caracteres'),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      branch_id: '',
      block_date: '',
      start_time: '',
      end_time: '',
      reason: '',
    },
    // Asignación de validaciones
    resolver: yupResolver(blockSchema),
  });

  //Gestión de errores
  const [error, setError] = useState('');
  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  // Accion submit
  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //Crear bloqueo
      BlockService.createBlock(DataForm)
        .then((response) => {
          //Respuesta al usuario
          if (response.data != null) {
            toast.success(
              `Bloqueo creado #${response.data.id} - ${response.data.branch} ${response.data.date_text} de ${response.data.start_time} a ${response.data.end_time}`,
              {
                duration: 4000,
                position: 'top-center',
              },
            );
            //Redirección a la tabla de bloqueos
            return navigate('/block-table');
          }
        })
        .catch((error) => {
          console.log(error);
          //El API manda el mensaje de la regla que no se cumplió (por ejemplo, un traslape)
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo crear el bloqueo',
            { duration: 6000 },
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  //Lista de sucursales
  const [dataBranches, setDataBranches] = useState({});
  const [loadedBranches, setLoadedBranches] = useState(false);
  useEffect(() => {
    BranchService.getBranches()
      .then((response) => {
        console.log(response);
        setDataBranches(response.data);
        setLoadedBranches(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoadedBranches(false);
      });
  }, []);

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              Crear Bloqueo
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Lista de sucursales */}
              {loadedBranches && (
                <Controller
                  name="branch_id"
                  control={control}
                  render={({ field }) => <SelectBranch field={field} data={dataBranches} />}
                />
              )}
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.branch_id ? errors.branch_id.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Controlador y entrada de formulario de la fecha */}
              <Controller
                name="block_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="block_date"
                    label="Fecha"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                    error={Boolean(errors.block_date)}
                    helperText={errors.block_date ? errors.block_date.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => <SelectHour field={field} id="start_time" label="Hora inicial" />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.start_time ? errors.start_time.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => <SelectHour field={field} id="end_time" label="Hora final" />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.end_time ? errors.end_time.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="reason"
                    label="Motivo (opcional)"
                    error={Boolean(errors.reason)}
                    helperText={errors.reason ? errors.reason.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/block-table')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
