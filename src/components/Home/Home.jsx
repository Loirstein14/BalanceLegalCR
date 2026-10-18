import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link } from 'react-router-dom';
import fotoLocal from '../../assets/balance-legal-local.jpg';
import logoBlanco from '../../assets/logo-balance-legal-blanco.png';

//Accesos rápidos a las secciones de la aplicación
const sections = [
  { title: 'Productos', text: 'Certificaciones, copias certificadas y libros legales.', link: '/product', icon: <InventoryIcon fontSize="large" /> },
  { title: 'Facturas', text: 'Historial de facturas con su detalle y totales.', link: '/invoice', icon: <ReceiptLongIcon fontSize="large" /> },
  { title: 'Reservas', text: 'Citas de la sucursal con su estado y detalle.', link: '/appointment', icon: <EventNoteIcon fontSize="large" /> },
];

export function Home() {
  return (
    // Fondo: foto original del local (sin filtro de color), apenas desenfocada y oscurecida
    // en el centro para que el letrero de la foto no compita con el texto de la página
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mx: 'calc(50% - 50vw)', //Ocupa todo el ancho de la pantalla, fuera del Container del Layout
        mt: -2, //Pega el fondo al encabezado (el Layout tiene 1rem de espacio arriba)
        mb: -9, //Llega hasta el footer (el Layout deja 4.5rem abajo para el footer fijo)
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        pb: 9,
      }}
    >
      {/* Capa 1: foto del local, levemente desenfocada */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${fotoLocal})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          filter: 'blur(2px)',
          transform: 'scale(1.04)', //Evita bordes claros por el desenfoque
        }}
      />
      {/* Capa 2: sombra neutra, más oscura en el centro (donde está el texto) y más clara en los bordes */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.55) 45%, rgba(0, 0, 0, 0.30) 100%)',
        }}
      />
      <Container sx={{ py: 6, position: 'relative' }} maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box component="img" src={logoBlanco} alt="Logo Balance Legal CR" sx={{ width: 140, height: 140, filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))' }} />
          <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'common.white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.8)' }}>
            Balance Legal CR
          </Typography>
          <Typography variant="h6" sx={{ color: 'grey.100', textShadow: '0 1px 3px rgba(0, 0, 0, 0.9), 0 2px 12px rgba(0, 0, 0, 0.8)' }}>
            Servicios legales y notariales con atención personalizada. Reserve su cita con el
            abogado de su preferencia y consulte nuestros productos.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {sections.map((item) => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
              <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.92)' }}>
                <CardActionArea component={Link} to={item.link} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.text}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
