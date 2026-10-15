import React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import AppointmentService from '../../services/AppointmentService';

//Historial de reservas del encargado (máximo 4 campos: fecha y hora, cliente, servicio y estado)
export function ListAppointments() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener las reservas de la sucursal del encargado
  useEffect(() => {
    AppointmentService.getAppointments()
      .then((response) => {
        console.log(response);
        setData(response.data);
        setError(response.error);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
              <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
                Historial de Reservas · {data[0].branch}
              </Typography>
            </Toolbar>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha y hora</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Servicio</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Detalle
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>
                        {row.appointment_date}
                        <Typography variant="body2" color="text.secondary">
                          {row.time_range}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.client}</TableCell>
                      <TableCell>{row.service}</TableCell>
                      <TableCell>
                        {/* El color del estado viene de la BD (appointment_statuses.color_hex) */}
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{ backgroundColor: row.status_color, color: 'common.white', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton
                            component={Link}
                            to={`/appointment/${row.id}`}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </>
  );
}
