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
import VisibilityIcon from '@mui/icons-material/Visibility';
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

//Encabezados de la tabla (máximo 4 campos)
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

//Historial de facturas, ordenado por fecha (más reciente primero)
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

  return (
    <>
      {data && data.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
              <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
                Historial de Facturas
              </Typography>
            </Toolbar>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableInvoicesHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {stableSort(data, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.number}</TableCell>
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
              count={data.length}
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
