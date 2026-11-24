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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import AppointmentService from '../../services/AppointmentService';

//Historial de reservas del encargado (máximo 4 campos: fecha y hora, cliente, servicio y estado)
//Se puede filtrar por cliente y/o por fecha
export function ListAppointments() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
  //Filtros: cliente y fecha ('' = sin filtro)
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');

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

  //Clientes que tienen reservas en la sucursal, sin repetir, para el select del filtro
  //findIndex devuelve la primera posición de ese cliente: si es la misma fila, es la primera vez que sale
  const clients = data
    ? data
        .filter((row, index) => data.findIndex((item) => item.client_id === row.client_id) === index)
        .sort((a, b) => a.client.localeCompare(b.client))
    : [];

  //Aplicar los filtros a la lista que vino del API (no se vuelve a llamar al API)
  //starts_at viene como 'aaaa-mm-dd hh:mm:ss', y el input de fecha da 'aaaa-mm-dd'
  const filtered = data
    ? data.filter(
        (row) =>
          (clientId === '' || row.client_id === clientId) &&
          (date === '' || row.starts_at.substring(0, 10) === date),
      )
    : [];

  //Quitar los dos filtros
  const cleanFilters = () => {
    setClientId('');
    setDate('');
  };

  return (
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 2 }, gap: 2, py: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ flex: '1 1 auto' }} variant="h6" component="div">
                Historial de Reservas · {data[0].branch}
              </Typography>
              {/* Filtro por cliente */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="filter-client">Cliente</InputLabel>
                <Select
                  labelId="filter-client"
                  label="Cliente"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {clients.map((row) => (
                    <MenuItem key={row.client_id} value={row.client_id}>
                      {row.client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Filtro por fecha */}
              <TextField
                size="small"
                type="date"
                label="Fecha"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button variant="outlined" startIcon={<FilterAltOffIcon />} onClick={cleanFilters}>
                Limpiar
              </Button>
              <Button component={Link} to="/appointment/create" variant="contained" startIcon={<AddIcon />}>
                Nueva reserva
              </Button>
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
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay reservas con esos filtros
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((row) => (
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
