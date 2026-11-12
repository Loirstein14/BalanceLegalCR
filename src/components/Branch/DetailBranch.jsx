import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BranchService from '../../services/BranchService';

//Una fila del detalle con ícono y texto
function InfoRow({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      {icon}
      <Typography variant="subtitle1">{children}</Typography>
    </Box>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.node.isRequired,
  children: PropTypes.node,
};

//Detalle de una sucursal con sus encargados
export function DetailBranch() {
  const routeParams = useParams(); //Agarrar el id de la sucursal de la ruta
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API para traer la sucursal
  useEffect(() => {
    BranchService.getBranchById(routeParams.id)
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
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && (
        <Grid container spacing={4}>
          {/* Información de la sucursal */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {data.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {data.description}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <InfoRow icon={<PlaceIcon color="primary" />}>{data.address}</InfoRow>
            <InfoRow icon={<PhoneIcon color="primary" />}>{data.phone}</InfoRow>
            <InfoRow icon={<EmailIcon color="primary" />}>{data.email}</InfoRow>
          </Grid>
          {/* Encargados */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Encargados ({data.managers.length})
              </Typography>
              {data.managers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Esta sucursal todavía no tiene encargados asignados.
                </Typography>
              ) : (
                <List dense>
                  {data.managers.map((m) => (
                    <ListItem key={m.id} disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={m.name} secondary={m.email} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/branch-table')}>
          Regresar
        </Button>
        <Button variant="contained" startIcon={<EditIcon />} component={Link} to={`/branch/update/${routeParams.id}`}>
          Modificar
        </Button>
      </Box>
    </Container>
  );
}
