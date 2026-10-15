import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppointmentService from '../../services/AppointmentService';

//Detalle de una reserva (cita)
export function DetailAppointment() {
  const routeParams = useParams(); //Obtener el id de la reserva de la ruta
  const navigate = useNavigate(); //Para regresar a la página anterior
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener una reserva
  useEffect(() => {
    AppointmentService.getAppointmentById(routeParams.id)
      .then((response) => {
        console.log(response.data);
        setData(response.data);
        setError(response.error);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [routeParams.id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  //Fila etiqueta: valor
  const field = (label, value) => (
    <Typography variant="body1" sx={{ mb: 0.5 }}>
      <Box component="span" sx={{ fontWeight: 'bold' }}>
        {label}:
      </Box>{' '}
      {value}
    </Typography>
  );

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 2 }}>
      {data && (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h5" component="h1" color="secondary" sx={{ fontWeight: 'bold' }}>
              Reserva #{data.id}
            </Typography>
            {/* Estado con su color, que viene de la BD */}
            <Chip
              label={data.status}
              sx={{ backgroundColor: data.status_color, color: 'common.white', fontWeight: 'bold' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generada el {data.created_date}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field('Fecha', data.appointment_date)}
              {field('Hora', data.time_range)}
              {field('Sucursal', data.branch)}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field('Servicio', data.service)}
              {field('Abogado', data.provider)}
              {field('Cliente', data.client)}
            </Grid>
          </Grid>
          {data.cancellation_reason && field('Motivo de cancelación', data.cancellation_reason)}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Preguntas de la reserva
          </Typography>
          <List>
            {data.answers &&
              data.answers.map((item) => (
                <ListItem key={item.id} alignItems="flex-start" disableGutters>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    <QuestionAnswerIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText primary={item.question} secondary={item.answer} />
                </ListItem>
              ))}
          </List>
        </Paper>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      </Box>
    </Container>
  );
}
