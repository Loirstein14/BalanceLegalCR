//https://mui.com/material-ui/react-table/#sorting-amp-selecting
import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddIcon from '@mui/icons-material/Add';
import { visuallyHidden } from '@mui/utils';
import { Link } from 'react-router-dom';
import InvoiceService from '../../services/InvoiceService';

//Ordenar descendente (el total se compara como número)
function descendingComparator(a, b, orderBy) {
  const valueA = orderBy === 'total' ? Number(a[orderBy]) : a[orderBy];
  const valueB = orderBy === 'total' ? Number(b[orderBy]) : b[orderBy];
  if (valueB < valueA) {
    return -1;
  }
  if (valueB > valueA) {
    return 1;
  }
  return 0;
}

//Comparar para ordenar
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

//Ordenar estable
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

//Color del estado de la factura (colores del tema de MUI)
//1 Proforma: naranja, 2 Facturado: verde, 3 Anulada: gris
const statusColor = (statusId) => {
  if (statusId === 1) return 'warning';
  if (statusId === 2) return 'success';
  return 'default';
};

//Encabezados de la tabla (máximo 4 campos; el estado va debajo del número de factura)
//La fecha se ordena con invoice_datetime (fecha completa) y se muestra con invoice_date
const headCells = [
  { id: 'number', numeric: false, label: 'Factura' },
  { id: 'invoice_datetime', numeric: false, label: 'Fecha' },
  { id: 'client', numeric: false, label: 'Cliente' },
  { id: 'total', numeric: true, label: 'Total' },
];

//Encabezado de la tabla con ordenamiento
function TableInvoicesHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 'bold' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'orden descendente' : 'orden ascendente'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
          Detalle
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

//Propiedades del encabezado
TableInvoicesHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

//Historial de facturas de la sucursal del encargado, ordenado por fecha (más reciente primero)
//Se puede filtrar por cliente y/o por fecha
export default function TableInvoices() {
  //Datos a cargar en la tabla
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener la lista de facturas
  useEffect(() => {
    InvoiceService.getInvoices()
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

  const [order, setOrder] = useState('desc'); //Más reciente primero
  const [orderBy, setOrderBy] = useState('invoice_datetime'); //Ordenado por fecha
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  //Filtros: cliente y fecha ('' = sin filtro)
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');

  //Cambiar el ordenamiento al dar clic en un encabezado
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  //Cambiar de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  //Cambiar cantidad de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  //Clientes que tienen facturas en la sucursal, sin repetir, para el select del filtro
  const clients = data
    ? data
        .filter((row, index) => data.findIndex((item) => item.client_id === row.client_id) === index)
        .sort((a, b) => a.client.localeCompare(b.client))
    : [];

  //Aplicar los filtros a la lista que vino del API (no se vuelve a llamar al API)
  //invoice_datetime viene como 'aaaa-mm-dd hh:mm:ss', y el input de fecha da 'aaaa-mm-dd'
  const filtered = data
    ? data.filter(
        (row) =>
          (clientId === '' || row.client_id === clientId) &&
          (date === '' || row.invoice_datetime.substring(0, 10) === date),
      )
    : [];

  //Al cambiar un filtro se vuelve a la primera página
  const changeClient = (value) => {
    setClientId(value);
    setPage(0);
  };
  const changeDate = (value) => {
    setDate(value);
    setPage(0);
  };
  //Quitar los dos filtros
  const cleanFilters = () => {
    setClientId('');
    setDate('');
    setPage(0);
  };

  return (
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 2 }, gap: 2, py: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ flex: '1 1 auto' }} variant="h6" component="div">
                Historial de Facturas · {data[0].branch}
              </Typography>
              {/* Filtro por cliente */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="filter-client">Cliente</InputLabel>
                <Select
                  labelId="filter-client"
                  label="Cliente"
                  value={clientId}
                  onChange={(e) => changeClient(e.target.value)}
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
                onChange={(e) => changeDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button variant="outlined" startIcon={<FilterAltOffIcon />} onClick={cleanFilters}>
                Limpiar
              </Button>
              <Button component={Link} to="/invoice/create" variant="contained" startIcon={<AddIcon />}>
                Nueva factura
              </Button>
            </Toolbar>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableInvoicesHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay facturas con esos filtros
                      </TableCell>
                    </TableRow>
                  )}
                  {stableSort(filtered, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>
                          {row.number}
                          <br />
                          {/* Estado: Proforma o Facturado */}
                          <Chip
                            label={row.status}
                            size="small"
                            color={statusColor(row.status_id)}
                            sx={{ mt: 0.5, fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>{row.invoice_date}</TableCell>
                        <TableCell>{row.client}</TableCell>
                        <TableCell align="right">
                          ₡{Number(row.total).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver factura">
                            <IconButton
                              component={Link}
                              to={`/invoice/${row.id}`}
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
            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Paper>
        </Box>
      )}
    </>
  );
}
