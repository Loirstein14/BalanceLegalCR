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
  //Fecha de hoy en formato aaaa-mm-dd (el mismo formato del input de fecha)
  const today = new Date().toLocaleDateString('en-CA');
  // Esquema de validación
  const blockSchema = yup.object({
    branch_id: yup
      .number()
      .typeError('Seleccione una sucursal')
      .required('La sucursal es requerida'),
    //Rango de fechas: se crea un bloqueo por cada día del rango que caiga en los días marcados
    start_date: yup
      .string()
      .required('La fecha inicial es requerida')
      //Validador propio (.test): la fecha no puede ser anterior a hoy
      .test('fecha-no-pasada', 'La fecha inicial no puede ser anterior a hoy', (value) => !value || value >= today),
    end_date: yup
      .string()
      .required('La fecha final es requerida')
      //this.parent son los demás campos: se compara con la fecha inicial
      .test('fecha-final', 'La fecha final debe ser igual o posterior a la inicial', function (value) {
        return !value || !this.parent.start_date || value >= this.parent.start_date;
      })
      //Máximo 3 meses por rango (igual que en el API)
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
      //this.parent son los demás campos del formulario: se compara con la hora inicial
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
      //Por defecto de lunes a viernes
      weekdays: [1, 2, 3, 4, 5],
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

  //Vista previa en tiempo real: fechas que se van a crear (mismo cálculo que hace el API)
  const [startDate, endDate, weekdays] = watch(['start_date', 'end_date', 'weekdays']);
  const rangeOk =
    Boolean(startDate) &&
    Boolean(endDate) &&
    endDate >= startDate &&
    differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) <= 92;
  //eachDayOfInterval: todos los días del rango; getISODay: 1 (lunes) a 7 (domingo)
  const dates = rangeOk
    ? eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).filter((day) =>
        weekdays.includes(getISODay(day)),
      )
    : [];
  //Fecha corta en español para la vista previa: 'lun 07/12'
  const shortDate = (day) => format(day, 'EEE dd/MM', { locale: es });

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
            //El API devuelve la lista de bloqueos creados (uno por fecha)
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
              Crear Bloqueos por rango de fechas
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
              {/* Vista previa: cuántos bloqueos se van a crear y en qué fechas */}
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
