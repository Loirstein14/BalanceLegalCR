import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import { FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AppointmentService from '../../services/AppointmentService';
import UserService from '../../services/UserService';
import ServiceService from '../../services/ServiceService';
import QuestionService from '../../services/QuestionService';
import { SelectClient } from './Form/SelectClient';
import { SelectBranchService } from './Form/SelectBranchService';
import { SelectAvailableHour } from './Form/SelectAvailableHour';

//registrar reserva: la hace el encargado fijo en su sucursal y escoge al cliente
export function CreateAppointment() {
  const navigate = useNavigate();
  //fecha de hoy: aaaa-mm-dd para comparar con el input y dd/mm/aaaa para mostrarla
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayText = format(new Date(), 'dd/MM/yyyy');

  //validaciones
  const appointmentSchema = yup.object({
    client_id: yup.number().typeError('Seleccione un cliente').required('El cliente es requerido'),
    service_id: yup.number().typeError('Seleccione un servicio').required('El servicio es requerido'),
    date: yup
      .string()
      .required('La fecha es requerida')
      //la fecha no puede ser antes de hoy
      .test('fecha-no-pasada', 'La fecha no puede ser anterior a hoy', (value) => !value || value >= today),
    start_time: yup.string().required('Seleccione la hora'),
    //una respuesta por pregunta, las reglas dependen del answer_type
    answers: yup.array().of(
      yup.object({
        answer_text: yup
          .string()
          .trim()
          .when(['answer_type', 'is_required'], ([answerType, isRequired], schema) => {
            let regla = schema;
            if (isRequired) {
              regla = regla.required('Esta pregunta es obligatoria');
            }
            if (answerType === 'number') {
              regla = regla.matches(/^\d+$/, {
                message: 'Digite solo números enteros',
                excludeEmptyString: true,
              });
            }
            return regla;
          }),
      }),
    ),
  });
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      client_id: '',
      service_id: '',
      date: '',
      start_time: '',
      answers: [],
    },
    resolver: yupResolver(appointmentSchema),
  });

  const [error, setError] = useState('');
  const onError = (errors, e) => console.log(errors, e);

  //encargado y su sucursal, los manda el API
  const [manager, setManager] = useState(null);
  const [dataServices, setDataServices] = useState([]);
  useEffect(() => {
    AppointmentService.getManager()
      .then((response) => {
        console.log(response);
        setManager(response.data);
        //con la sucursal se cargan los servicios que da
        return ServiceService.getServicesByBranch(response.data.branch_id);
      })
      .then((response) => {
        setDataServices(response.data);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, []);

  //estado inicial con su color, no se puede cambiar
  const [status, setStatus] = useState(null);
  useEffect(() => {
    AppointmentService.getInitialStatus()
      .then((response) => setStatus(response.data))
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, []);

  const [dataClients, setDataClients] = useState([]);
  const [loadedClients, setLoadedClients] = useState(false);
  useEffect(() => {
    UserService.getCustomers()
      .then((response) => {
        setDataClients(response.data);
        setLoadedClients(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, []);

  //preguntas: se pintan según su tipo y cada una tiene su respuesta en el form
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    QuestionService.getQuestions()
      .then((response) => {
        setQuestions(response.data);
        //una respuesta vacía por pregunta, answer_type e is_required los usa yup
        setValue(
          'answers',
          response.data.map((question) => ({
            question_id: question.id,
            answer_type: question.answer_type,
            is_required: question.is_required === 1,
            answer_text: '',
          })),
        );
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, [setValue]);

  //horas libres: se vuelven a pedir cada vez que cambia la fecha o el servicio
  const date = watch('date');
  const serviceId = watch('service_id');
  //solo se consulta si ya hay servicio y una fecha válida
  const readyHours = Boolean(serviceId) && Boolean(date) && date >= today;
  const [hours, setHours] = useState([]);
  const [hoursMessage, setHoursMessage] = useState('');
  //se le suma 1 cuando el API rechaza la hora (alguien más la agarró) para recargar
  const [reloadHours, setReloadHours] = useState(0);
  useEffect(() => {
    //si cambió la fecha o el servicio la hora escogida ya no sirve
    setValue('start_time', '');
    if (!readyHours) return;
    //active es para que una respuesta vieja no pise la lista nueva
    let active = true;
    AppointmentService.getAvailableHours(date, serviceId)
      .then((response) => {
        if (active) {
          setHours(response.data);
          setHoursMessage('');
        }
      })
      .catch((error) => {
        //si no hay horas el API responde 400 con el mensaje
        if (active) {
          setHours([]);
          setHoursMessage(
            typeof error.response?.data === 'string' ? error.response.data : 'No se pudieron cargar las horas',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [date, serviceId, readyHours, reloadHours, setValue]);

  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    //el API solo ocupa question_id y answer_text de cada respuesta
    const appointment = {
      client_id: DataForm.client_id,
      service_id: DataForm.service_id,
      date: DataForm.date,
      start_time: DataForm.start_time,
      answers: DataForm.answers.map((answer) => ({
        question_id: answer.question_id,
        answer_text: answer.answer_text.trim(),
      })),
    };
    try {
      AppointmentService.createAppointment(appointment)
        .then((response) => {
          if (response.data != null) {
            toast.success(
              `Reserva #${response.data.id} registrada para ${response.data.client} el ${response.data.appointment_date} de ${response.data.time_range}. Se generó la proforma #${response.data.invoice_id}`,
              {
                duration: 5000,
                position: 'top-center',
              },
            );
            return navigate('/appointment');
          }
        })
        .catch((error) => {
          console.log(error);
          //el API manda el mensaje de la regla que falló (ej la hora ya se ocupó)
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo registrar la reserva',
            { duration: 6000 },
          );
          //se recargan las horas por si la que escogió ya no está libre
          setReloadHours((value) => value + 1);
        });
    } catch (error) {
      console.error(error);
    }
  };

  //campo de la respuesta según el tipo: texto, sí/no o número
  const answerInput = (question, index, field) => {
    const answerError = errors.answers?.[index]?.answer_text;
    if (question.answer_type === 'yes_no') {
      return (
        <>
          <FormLabel id={`answer-${question.id}`}>{question.question_text}</FormLabel>
          <RadioGroup {...field} row aria-labelledby={`answer-${question.id}`}>
            <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
          <FormHelperText sx={{ color: '#d32f2f' }}>{answerError ? answerError.message : ' '}</FormHelperText>
        </>
      );
    }
    return (
      <TextField
        {...field}
        id={`answer-${question.id}`}
        label={question.question_text}
        type={question.answer_type === 'number' ? 'number' : 'text'}
        multiline={question.answer_type === 'text'}
        minRows={question.answer_type === 'text' ? 2 : undefined}
        slotProps={question.answer_type === 'number' ? { htmlInput: { min: 0, step: 1 } } : undefined}
        error={Boolean(answerError)}
        helperText={answerError ? answerError.message : ' '}
      />
    );
  };

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
              Registrar Reserva
            </Typography>
            {/* estado inicial con su color, no se puede cambiar */}
            {status && (
              <Chip
                label={`Estado: ${status.name}`}
                sx={{ backgroundColor: status.color_hex, color: 'common.white', fontWeight: 'bold' }}
              />
            )}
          </Grid>
          {/* esto no se puede editar */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <TextField
                id="branch"
                label="Sucursal"
                value={manager ? manager.branch : ''}
                slotProps={{ input: { readOnly: true } }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <TextField
                id="manager"
                label="Encargado"
                value={manager ? manager.name : ''}
                slotProps={{ input: { readOnly: true } }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <TextField
                id="created"
                label="Fecha de registro"
                value={todayText}
                slotProps={{ input: { readOnly: true } }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {loadedClients && (
                <Controller
                  name="client_id"
                  control={control}
                  render={({ field }) => <SelectClient field={field} data={dataClients} />}
                />
              )}
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.client_id ? errors.client_id.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="service_id"
                control={control}
                render={({ field }) => <SelectBranchService field={field} data={dataServices} />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.service_id ? errors.service_id.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="date"
                    label="Fecha de la cita"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                    error={Boolean(errors.date)}
                    helperText={errors.date ? errors.date.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          {/* solo las horas libres para ese servicio y esa fecha */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <SelectAvailableHour
                    field={field}
                    data={readyHours ? hours : []}
                    disabled={!readyHours || hours.length === 0}
                  />
                )}
              />
              <FormHelperText sx={{ color: errors.start_time ? '#d32f2f' : 'text.secondary' }}>
                {errors.start_time
                  ? errors.start_time.message
                  : !readyHours
                    ? 'Escoja el servicio y la fecha para ver las horas disponibles'
                    : hoursMessage || ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ m: 1 }}>
              Preguntas del caso
            </Typography>
          </Grid>
          {questions.map((question, index) => (
            <Grid size={{ xs: 12, sm: question.answer_type === 'text' ? 12 : 6 }} key={question.id}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller
                  name={`answers.${index}.answer_text`}
                  control={control}
                  render={({ field }) => answerInput(question, index, field)}
                />
              </FormControl>
            </Grid>
          ))}
          <Grid size={12}>
            <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/appointment')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
