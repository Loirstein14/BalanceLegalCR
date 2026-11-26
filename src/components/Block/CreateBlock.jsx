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
import { differenceInCalendarDays, eachDayOfInterval, getISODay, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import BlockService from '../../services/BlockService';
import BranchService from '../../services/BranchService';
import { SelectBranch } from '../Schedule/Form/SelectBranch';
import { SelectHour } from '../Schedule/Form/SelectHour';
import { SelectWeekdays } from '../Schedule/Form/SelectWeekdays';

export function CreateBlock() {
  const navigate = useNavigate();
  //hoy en aaaa-mm-dd, el mismo formato del input de fecha
  const today = new Date().toLocaleDateString('en-CA');
  //validaciones
  const blockSchema = yup.object({
    branch_id: yup
      .number()
      .typeError('Seleccione una sucursal')
      .required('La sucursal es requerida'),
    //se crea un bloqueo por cada día del rango que caiga en los días marcados
    start_date: yup
      .string()
      .required('La fecha inicial es requerida')
      //la fecha no puede ser antes de hoy
      .test('fecha-no-pasada', 'La fecha inicial no puede ser anterior a hoy', (value) => !value || value >= today),
    end_date: yup
      .string()
      .required('La fecha final es requerida')
      //this.parent son los otros campos, aquí se compara con la fecha inicial
      .test('fecha-final', 'La fecha final debe ser igual o posterior a la inicial', function (value) {
        return !value || !this.parent.start_date || value >= this.parent.start_date;
      })
      //máximo 3 meses, igual que en el API
      .test('maximo-3-meses', 'El rango puede ser de máximo 3 meses', function (value) {
        return (
          !value ||
          !this.parent.start_date ||
          differenceInCalendarDays(parseISO(value), parseISO(this.parent.start_date)) <= 92
        );
      }),
    weekdays: yup.array().min(1, 'Seleccione al menos un día de la semana'),
    start_time: yup.string().required('La hora inicial es requerida'),
    end_time: yup
      .string()
      .required('La hora final es requerida')
      //this.parent son los otros campos, aquí se compara con la hora inicial
      .test('hora-final', 'La hora final debe ser mayor a la hora inicial', function (value) {
        return !value || !this.parent.start_time || value > this.parent.start_time;
      }),
    reason: yup.string().max(150, 'El motivo puede tener máximo 150 caracteres'),
  });
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      branch_id: '',
      start_date: '',
      end_date: '',
      //por defecto de lunes a viernes
      weekdays: [1, 2, 3, 4, 5],
      start_time: '',
      end_time: '',
      reason: '',
    },
    resolver: yupResolver(blockSchema),
  });

  const [error, setError] = useState('');
  const onError = (errors, e) => console.log(errors, e);

  //vista previa en tiempo real de las fechas que se van a crear (el mismo cálculo del API)
  const [startDate, endDate, weekdays] = watch(['start_date', 'end_date', 'weekdays']);
  const rangeOk =
    Boolean(startDate) &&
    Boolean(endDate) &&
    endDate >= startDate &&
    differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) <= 92;
  //eachDayOfInterval da todos los días del rango y getISODay 1 (lunes) a 7 (domingo)
  const dates = rangeOk
    ? eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).filter((day) =>
        weekdays.includes(getISODay(day)),
      )
    : [];
  //fecha corta para la vista previa: 'lun 07/12'
  const shortDate = (day) => format(day, 'EEE dd/MM', { locale: es });

  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      BlockService.createBlock(DataForm)
        .then((response) => {
          if (response.data != null) {
            //el API devuelve la lista de bloqueos creados, uno por fecha
            const first = response.data[0];
            const last = response.data[response.data.length - 1];
            toast.success(
              response.data.length === 1
                ? `Bloqueo creado - ${first.branch} ${first.date_text} de ${first.start_time} a ${first.end_time}`
                : `Se crearon ${response.data.length} bloqueos - ${first.branch} del ${first.date_text} al ${last.date_text} de ${first.start_time} a ${first.end_time}`,
              {
                duration: 5000,
                position: 'top-center',
              },
            );
            return navigate('/block-table');
          }
        })
        .catch((error) => {
          console.log(error);
          //el API manda el mensaje de la regla que falló (ej un traslape)
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
              Crear Bloqueos por rango de fechas
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="start_date"
                    label="Desde"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                    error={Boolean(errors.start_date)}
                    helperText={errors.start_date ? errors.start_date.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="end_date"
                    label="Hasta"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate || today } }}
                    error={Boolean(errors.end_date)}
                    helperText={errors.end_date ? errors.end_date.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="weekdays"
                control={control}
                render={({ field }) => <SelectWeekdays field={field} />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.weekdays ? errors.weekdays.message : ' '}
              </FormHelperText>
              {/* cuántos bloqueos se van a crear y en qué fechas */}
              {rangeOk && (
                <Typography variant="body2" color={dates.length > 0 ? 'text.secondary' : '#d32f2f'}>
                  {dates.length === 0
                    ? 'Ninguna fecha del rango cae en los días marcados'
                    : `Se van a crear ${dates.length} bloqueos: ` +
                      (dates.length <= 6
                        ? dates.map(shortDate).join(', ')
                        : `${dates.slice(0, 3).map(shortDate).join(', ')} ... ${shortDate(dates[dates.length - 1])}`)}
                </Typography>
              )}
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
