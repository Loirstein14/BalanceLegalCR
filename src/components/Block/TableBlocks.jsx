import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockService from '../../services/BlockService';
import BranchService from '../../services/BranchService';

//Tabla de mantenimiento de bloqueos (horas en que la sucursal no atiende): se puede filtrar por sucursal
export default function TableBlocks() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  //Sucursal escogida en el filtro ('' = todas)
  const [branchId, setBranchId] = useState('');

  //Lista de sucursales para el filtro
  const [dataBranches, setDataBranches] = useState([]);
  useEffect(() => {
    BranchService.getBranches()
      .then((response) => {
        setDataBranches(response.data);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, []);

  //Llamar al API: todos los bloqueos o solo los de la sucursal escogida
  useEffect(() => {
    const request = branchId ? BlockService.getBlocksByBranch(branchId) : BlockService.getBlocks();
    request
      .then((response) => {
        setData(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        //Si la sucursal no tiene bloqueos el API responde con error: la tabla queda vacía
        console.log(error);
        setData([]);
        setLoaded(true);
      });
    setPage(0);
  }, [branchId]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 2 }, gap: 2, py: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ flex: '1 1 auto' }} variant="h6" component="div">
            Mantenimiento de Bloqueos
          </Typography>
          {/* Filtro por sucursal */}
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="filter-branch">Sucursal</InputLabel>
            <Select
              labelId="filter-branch"
              label="Sucursal"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {dataBranches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button component={Link} to="/block/create" variant="contained" startIcon={<AddIcon />}>
            Nuevo bloqueo
          </Button>
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sucursal</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hora inicio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hora fin</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay bloqueos registrados
                  </TableCell>
                </TableRow>
              )}
              {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.branch}</TableCell>
                  <TableCell>{row.date_text}</TableCell>
                  <TableCell>{row.start_time}</TableCell>
                  <TableCell>{row.end_time}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton component={Link} to={`/block/${row.id}`} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modificar">
                      <IconButton component={Link} to={`/block/update/${row.id}`} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
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
