import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import toast from 'react-hot-toast';
import InvoiceService from '../../services/InvoiceService';
import { DollarTotal } from './DollarTotal';

//colones con dos decimales
const money = (value) =>
  '₡' + Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2 });

//detalle de una factura
export function DetailInvoice() {
  const routeParams = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  //ventana para confirmar la anulación
  const [open, setOpen] = useState(false);

  useEffect(() => {
    InvoiceService.getInvoiceById(routeParams.id)
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

  //anular la factura y pintarla con el estado nuevo
  const cancelInvoice = () => {
    setOpen(false);
    InvoiceService.cancelInvoice({ id: data.id })
      .then((response) => {
        setData(response.data);
        toast.success(`La factura ${response.data.number} quedó ${response.data.status}`, {
          duration: 4000,
          position: 'top-center',
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          typeof error.response?.data === 'string' && error.response.data
            ? error.response.data
            : 'No se pudo anular la factura',
          { duration: 6000 },
        );
      });
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 2 }}>
      {data && (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          {/* encabezado */}
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Typography variant="h5" component="h1" color="secondary" sx={{ fontWeight: 'bold' }}>
                {data.business_name}
              </Typography>
              <Typography variant="subtitle1">{data.branch_name}</Typography>
              <Typography variant="body2">{data.branch_address}</Typography>
              <Typography variant="body2">Tel. {data.branch_phone}</Typography>
              <Typography variant="body2">{data.branch_email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Factura {data.number}
              </Typography>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 'bold' }}>Fecha:</Box> {data.invoice_date}
              </Typography>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 'bold' }}>Estado:</Box> {data.status}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Cliente
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {data.client_name}
          </Typography>
          <Typography variant="body2">Identificación: {data.client_id_number}</Typography>
          <Typography variant="body2">Correo: {data.client_email}</Typography>

          {/* detalle */}
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'secondary.main' }}>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Descripción</TableCell>
                  <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Cantidad</TableCell>
                  <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Precio</TableCell>
                  <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items &&
                  data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.item_type}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{money(item.unit_price)}</TableCell>
                      <TableCell align="right">{money(item.line_subtotal)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* totales */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Box sx={{ minWidth: 280 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">{money(data.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">IVA ({Number(data.tax_rate)}%)</Typography>
                <Typography variant="body1">{money(data.tax_total)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total a pagar</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{money(data.total)}</Typography>
              </Box>
              {/* total en dólares */}
              <Box sx={{ mt: 1 }}>
                <DollarTotal total={Number(data.total)} />
              </Box>
            </Box>
          </Box>
        </Paper>
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
        {/* solo las facturas en Facturado se pueden anular */}
        {data && data.status_id === 2 && (
          <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => setOpen(true)}>
            Anular factura
          </Button>
        )}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Anular factura</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea anular la factura {data?.number}? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>No</Button>
          <Button color="error" variant="contained" onClick={cancelInvoice}>
            Sí, anular
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
