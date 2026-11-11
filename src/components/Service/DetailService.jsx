import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel';
import ServiceService from '../../services/ServiceService';

//Una fila del detalle tipo "Etiqueta: valor"
function InfoRow({ label, children }) {
  return (
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      <Box component="span" sx={{ fontWeight: 'bold' }}>
        {label}:
      </Box>{' '}
      {children}
    </Typography>
  );
}

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

//Detalle de un servicio
export function DetailService() {
  const routeParams = useParams(); //Agarrar el id del servicio de la ruta
  const navigate = useNavigate();
  const IMG_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API para traer el servicio
  useEffect(() => {
    ServiceService.getServiceById(routeParams.id)
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
          {/* Imagen */}
          <Grid size={{ xs: 12, md: 5 }}>
            {data.image_path ? (
              <Box component="img" sx={{ borderRadius: '4%', maxWidth: '100%', height: 'auto' }} alt={data.name} src={`${IMG_URL}/${data.image_path}`} />
            ) : (
              <Box sx={{ borderRadius: '4%', bgcolor: 'primary.main', color: 'white', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GavelIcon sx={{ fontSize: 96 }} />
              </Box>
            )}
          </Grid>
          {/* Información */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {data.name}
              </Typography>
              {!data.is_active && <Chip label="Inactivo" size="small" />}
            </Box>
            <Typography variant="h5" color="secondary" gutterBottom>
              ₡{Number(data.price).toLocaleString('es-CR')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 2 }}>
              {data.description}
            </Typography>
            <InfoRow label="Duración">{data.duration_minutes / 60} {data.duration_minutes === 60 ? 'hora' : 'horas'}</InfoRow>
            <InfoRow label="Modalidad">{data.modality_name}</InfoRow>
            <InfoRow label="Requisitos">{data.requirements || 'No requiere documentos'}</InfoRow>
            <InfoRow label="Sucursales">{data.branches || 'Aún no se ofrece en ninguna sucursal'}</InfoRow>
          </Grid>
        </Grid>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/service-table')}>
          Regresar
        </Button>
        <Button variant="contained" startIcon={<EditIcon />} component={Link} to={`/service/update/${routeParams.id}`}>
          Modificar
        </Button>
      </Box>
    </Container>
  );
}
