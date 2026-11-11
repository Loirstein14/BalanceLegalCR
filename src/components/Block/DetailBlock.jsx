import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import StoreIcon from '@mui/icons-material/Store';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotesIcon from '@mui/icons-material/Notes';
import PersonIcon from '@mui/icons-material/Person';
import BlockService from '../../services/BlockService';

//Detalle de un bloqueo
export function DetailBlock() {
  const routeParams = useParams(); //Id del bloqueo que viene en la ruta
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API para traer el bloqueo
  useEffect(() => {
    BlockService.getBlockById(routeParams.id)
      .then((response) => {
        setData(response.data);
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

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 2 }}>
      {data && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Bloqueo de horario
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <StoreIcon color="primary" />
            <Typography variant="subtitle1">{data.branch}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <EventIcon color="primary" />
            <Typography variant="subtitle1">{data.date_text}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="subtitle1">
              De {data.start_time} a {data.end_time}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <NotesIcon color="primary" />
            <Typography variant="subtitle1">{data.reason || 'Sin motivo'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="subtitle1">Registrado por {data.created_by}</Typography>
          </Box>
        </Paper>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/block-table')}>
          Regresar
        </Button>
        <Button variant="contained" startIcon={<EditIcon />} component={Link} to={`/block/update/${routeParams.id}`}>
          Modificar
        </Button>
      </Box>
    </Container>
  );
}
