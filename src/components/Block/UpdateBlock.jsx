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
import BlockService from '../../services/BlockService';
import BranchService from '../../services/BranchService';
import { SelectBranch } from '../Schedule/Form/SelectBranch';
import { SelectHour } from '../Schedule/Form/SelectHour';

export function UpdateBlock() {
  const navigate = useNavigate();
  const routeParams = useParams();
  const id = routeParams.id || null;
  const [values, setValores] = useState(null);
  useEffect(() => {
    if (id != undefined && !isNaN(Number(id))) {
      BlockService.getBlockById(id)
        .then((response) => {
          console.log(response.data);
          //solo los campos que usa el form
          setValores({
            id: response.data.id,
            branch_id: response.data.branch_id,
            block_date: response.data.block_date,
            start_time: response.data.start_time,
            end_time: response.data.end_time,
            reason: response.data.reason ?? '',
          });
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
  }, [id]);
  //fecha de hoy en aaaa-mm-dd
  const today = new Date().toLocaleDateString('en-CA');
  //validaciones
  const blockSchema = yup.object({
    branch_id: yup
      .number()
      .typeError('Seleccione una sucursal')
      .required('La sucursal es requerida'),
    block_date: yup
      .string()
      .required('La fecha es requerida')
      //la fecha no puede ser antes de hoy
      .test('fecha-no-pasada', 'La fecha no puede ser anterior a hoy', (value) => !value || value >= today),
    start_time: yup.string().required('La hora inicial es requerida'),
    end_time: yup
      .string()
      .required('La hora final es requerida')
      //se compara con la hora inicial
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
    values,
    resolver: yupResolver(blockSchema),
  });

  const [error, setError] = useState('');
  const onError = (errors, e) => console.log(errors, e);

  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //DataForm ya trae el id porque viene en values
      BlockService.updateBlock(DataForm)
        .then((response) => {
          if (response.data != null) {
            toast.success(
              `Bloqueo actualizado #${response.data.id} - ${response.data.branch} ${response.data.date_text} de ${response.data.start_time} a ${response.data.end_time}`,
              {
                duration: 4000,
                position: 'top-center',
              },
            );
            return navigate('/block-table');
          }
        })
        .catch((error) => {
          console.log(error);
          //el API manda el mensaje del error
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo actualizar el bloqueo',
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
              Actualizar Bloqueo
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
