import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import ProductService from '../../services/ProductService';

//detalle de un producto
export function DetailProduct() {
  const routeParams = useParams();
  const navigate = useNavigate();
  //url de las imágenes que están en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    ProductService.getProductById(routeParams.id)
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

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            {data.image_path ? (
              <Box
                component="img"
                sx={{ borderRadius: '4%', maxWidth: '100%', height: 'auto' }}
                alt={data.name}
                src={`${BASE_URL}/${data.image_path}`}
              />
            ) : (
              //si todavía no tiene imagen se pone un ícono
              <Box sx={{ borderRadius: '4%', bgcolor: 'primary.main', color: 'white', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 96 }} />
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {data.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {data.category}
            </Typography>
            <Typography variant="h5" color="secondary" gutterBottom>
              ₡{Number(data.price).toLocaleString('es-CR')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 2 }}>
              {data.description}
            </Typography>
            <Typography variant="subtitle1">
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Formato de entrega:
              </Box>{' '}
              {data.delivery_format}
            </Typography>
            <Typography variant="subtitle1">
              <Box component="span" sx={{ fontWeight: 'bold' }}>
                Tiempo de entrega:
              </Box>{' '}
              {data.delivery_days} día(s) hábil(es)
            </Typography>
          </Grid>
        </Grid>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
        {/* con el login este botón solo le sale al encargado y al admin */}
        <Button variant="contained" startIcon={<EditIcon />} component={Link} to={`/product/update/${routeParams.id}`}>
          Modificar
        </Button>
      </Box>
    </Container>
  );
}