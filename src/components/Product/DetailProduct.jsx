import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProductService from '../../services/ProductService';

//Detalle de un producto
export function DetailProduct() {
  const routeParams = useParams(); //Obtener el id del producto de la ruta
  const navigate = useNavigate(); //Para regresar a la página anterior
  //Url para acceder a las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener un producto
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
  }, [routeParams.id]); //Se ejecuta cada vez que cambia el id de la ruta

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && (
        <Grid container spacing={4}>
          {/* Imagen */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              component="img"
              sx={{ borderRadius: '4%', maxWidth: '100%', height: 'auto' }}
              alt={data.name}
              src={`${BASE_URL}/${data.image_path}`}
            />
          </Grid>
          {/* Información */}
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