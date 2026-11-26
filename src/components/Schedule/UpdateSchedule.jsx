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
import ScheduleService from '../../services/ScheduleService';
import BranchService from '../../services/BranchService';
import { SelectBranch } from './Form/SelectBranch';
import { SelectHour } from './Form/SelectHour';

export function UpdateSchedule() {
  const navigate = useNavigate();
  const routeParams = useParams();
  const id = routeParams.id || null;
  const [values, setValores] = useState(null);
  useEffect(() => {
    if (id != undefined && !isNaN(Number(id))) {
      ScheduleService.getScheduleById(id)
        .then((response) => {
          console.log(response.data);
          //solo los campos que usa el form
          setValores({
            id: response.data.id,
            branch_id: response.data.branch_id,
            schedule_date: response.data.schedule_date,
            start_time: response.data.start_time,
            end_time: response.data.end_time,
          });
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
  }, [id]);
  //hoy en aaaa-mm-dd, el mismo formato del input de fecha
  const today = new Date().toLocaleDateString('en-CA');
  //validaciones
  const scheduleSchema = yup.object({
    branch_id: yup
      .number()
      .typeError('Seleccione una sucursal')
      .required('La sucursal es requerida'),
    schedule_date: yup
      .string()
      .required('La fecha es requerida')
      //la fecha no puede ser antes de hoy
      .test('fecha-no-pasada', 'La fecha no puede ser anterior a hoy', (value) => !value || value >= today),
    start_time: yup.string().required('La hora inicial es requerida'),
    end_time: yup
      .string()
      .required('La hora final es requerida')
      //this.parent son los otros campos, aquí se compara con la hora inicial
      .test('hora-final', 'La hora final debe ser mayor a la hora inicial', function (value) {
        return !value || !this.parent.start_time || value > this.parent.start_time;
      }),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      branch_id: '',
      schedule_date: '',
      start_time: '',
      end_time: '',
    },
    values,
    resolver: yupResolver(scheduleSchema),
  });

  const [error, setError] = useState('');
  const onError = (errors, e) => console.log(errors, e);

  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //DataForm ya trae el id porque viene en values
      ScheduleService.updateSchedule(DataForm)
        .then((response) => {
          if (response.data != null) {
            toast.success(
              `Horario actualizado #${response.data.id} - ${response.data.branch} ${response.data.date_text} de ${response.data.start_time} a ${response.data.end_time}`,
              {
                duration: 4000,
                position: 'top-center',
              },
            );
            return navigate('/schedule-table');
          }
        })
        .catch((error) => {
          console.log(error);
          //el API manda el mensaje de la regla que falló (ej un traslape)
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo actualizar el horario',
            { duration: 6000 },
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

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
              Actualizar Horario
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
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
              <Controller
                name="schedule_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="schedule_date"
                    label="Fecha"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                    error={Boolean(errors.schedule_date)}
                    helperText={errors.schedule_date ? errors.schedule_date.message : ' '}
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
            <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/schedule-table')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
