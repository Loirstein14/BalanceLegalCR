import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import ServiceService from '../../services/ServiceService';

//Tabla de mantenimiento de servicios: listar, buscar por nombre, ver detalle, crear y modificar
export default function TableServices() {
  //Url para llegar a las imágenes que están en el API
  const IMG_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState(''); //Lo que se escribe en el buscador
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Llamar al API para traer la lista de servicios
  useEffect(() => {
    ServiceService.getServices()
      .then((response) => {
        setData(response.data);
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

  //Servicios que coinciden con lo que se buscó (sin importar mayúsculas)
  const filtered = (data ?? []).filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 2 }, gap: 2, flexWrap: 'wrap', py: 1 }}>
          <Typography sx={{ flex: '1 1 auto' }} variant="h6" component="div">
            Mantenimiento de Servicios
          </Typography>
          <TextField
            size="small"
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button component={Link} to="/service/create" variant="contained" startIcon={<AddIcon />}>
            Nuevo servicio
          </Button>
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Servicio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Duración</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Modalidad</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Precio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar variant="rounded" src={row.image_path ? `${IMG_URL}/${row.image_path}` : undefined} sx={{ bgcolor: 'primary.main' }}>
                        <GavelIcon />
                      </Avatar>
                      {row.name}
                      {!row.is_active && <Chip label="Inactivo" size="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>{row.duration_minutes / 60} {row.duration_minutes === 60 ? 'hora' : 'horas'}</TableCell>
                  <TableCell>{row.modality_name}</TableCell>
                  <TableCell align="right">₡{Number(row.price).toLocaleString('es-CR')}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton component={Link} to={`/service/${row.id}`} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modificar">
                      <IconButton component={Link} to={`/service/update/${row.id}`} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay servicios que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
}
