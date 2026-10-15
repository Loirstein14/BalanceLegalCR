import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import BalanceIcon from '@mui/icons-material/Balance';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link } from 'react-router-dom';

//Accesos rápidos a las secciones de la aplicación
const sections = [
  { title: 'Productos', text: 'Certificaciones, copias certificadas y libros legales.', link: '/product', icon: <InventoryIcon fontSize="large" /> },
  { title: 'Facturas', text: 'Historial de facturas con su detalle y totales.', link: '/invoice', icon: <ReceiptLongIcon fontSize="large" /> },
  { title: 'Reservas', text: 'Citas de la sucursal con su estado y detalle.', link: '/appointment', icon: <EventNoteIcon fontSize="large" /> },
];

export function Home() {
  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <BalanceIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography component="h1" variant="h3" color="secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
          Balance Legal CR
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Servicios legales y notariales con atención personalizada. Reserve su cita con el
          abogado de su preferencia y consulte nuestros productos.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {sections.map((item) => (
          <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
            <Card sx={{ height: '100%' }}>
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
  );
}
