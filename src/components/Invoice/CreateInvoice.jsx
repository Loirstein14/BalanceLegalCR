import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormHelperText } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import InvoiceService from '../../services/InvoiceService';
import UserService from '../../services/UserService';
import ServiceService from '../../services/ServiceService';
import ProductService from '../../services/ProductService';
import { SelectClient } from '../Appointment/Form/SelectClient';
import { SelectItem } from './Form/SelectItem';
import { DollarTotal } from './DollarTotal';

//celdas igual que el Cart del profe
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 15,
    color: theme.palette.text.primary,
  },
}));

//formato de plata en colones
const money = (value) =>
  '₡' + Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//redondear a 2 decimales igual que la BD y el API
const round2 = (value) => Math.round(value * 100) / 100;

//registrar factura y también facturar proforma
export function CreateInvoice() {
  const navigate = useNavigate();
  //si la ruta trae id es que se está facturando esa proforma
  const routeParams = useParams();
  const id = routeParams.id || null;
  const isProforma = id !== null;
  //fecha de hoy dd/mm/aaaa
  const todayText = format(new Date(), 'dd/MM/yyyy');

  //validaciones
  const invoiceSchema = yup.object({
    client_id: yup.number().typeError('Seleccione un cliente').required('El cliente es requerido'),
    items: yup
      .array()
      .of(
        yup.object({
          item: yup.string().required('Seleccione un producto o servicio'),
          quantity: yup
            .number()
            .typeError('Solo números')
            .required('La cantidad es requerida')
            .integer('Solo números enteros')
            .min(1, 'Mínimo 1')
            .max(999, 'Máximo 999'),
        }),
      )
      .min(1, 'Agregue al menos un producto o servicio')
      //que no se repita el mismo producto o servicio en dos líneas
      .test('sin-repetidos', 'Hay un producto o servicio repetido', (items) => {
        const keys = items.map((line) => line.item).filter((key) => key !== '');
        return new Set(keys).size === keys.length;
      }),
  });
  //datos de la proforma para precargar el form
  const [proforma, setProforma] = useState(null);
  const [proformaValues, setProformaValues] = useState(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      client_id: '',
      //arranca con una línea vacía
      items: [{ item: '', quantity: 1 }],
    },
    //se precarga con la proforma
    values: proformaValues,
    resolver: yupResolver(invoiceSchema),
  });
  //líneas de la factura igual que los actores
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const [error, setError] = useState('');
  const onError = (errors, e) => console.log(errors, e);

  //encargado sucursal e impuesto
  const [header, setHeader] = useState(null);
  //catálogo de servicios y productos
  const [catalog, setCatalog] = useState([]);
  useEffect(() => {
    let services = [];
    InvoiceService.getHeader()
      .then((response) => {
        console.log(response);
        setHeader(response.data);
        //con la sucursal se cargan sus servicios
        return ServiceService.getServicesByBranch(response.data.branch_id);
      })
      .then((response) => {
        services = response.data.map((row) => ({ key: 'S-' + row.id, type: 'S', id: row.id, name: row.name, price: row.price }));
        return ProductService.getProducts();
      })
      .then((response) => {
        const products = response.data.map((row) => ({ key: 'P-' + row.id, type: 'P', id: row.id, name: row.name, price: row.price }));
        setCatalog([...services, ...products]);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, []);

  //cargar la proforma en el form
  useEffect(() => {
    if (!id) return;
    InvoiceService.getInvoiceById(id)
      .then((response) => {
        console.log(response);
        //solo se factura si todavía es proforma
        if (response.data.status_id !== 1) {
          toast.error(`${response.data.number} ya no es una proforma (estado: ${response.data.status})`);
          navigate('/invoice');
          return;
        }
        setProforma(response.data);
        //cliente y líneas de la proforma
        setProformaValues({
          client_id: response.data.client_id,
          items: response.data.items.map((line) => ({
            item: line.service_id ? 'S-' + line.service_id : 'P-' + line.product_id,
            quantity: line.quantity,
          })),
        });
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, [id, navigate]);

  const [dataClients, setDataClients] = useState([]);
  const [loadedClients, setLoadedClients] = useState(false);
  useEffect(() => {
    UserService.getCustomers()
      .then((response) => {
        setDataClients(response.data);
        setLoadedClients(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
      });
  }, []);

  //watch trae las líneas cada vez que cambian
  const items = watch('items');
  const taxRate = header ? Number(header.tax_rate) : 0;
  //subtotal impuesto y total de una línea
  const lineValues = (line) => {
    const row = catalog.find((item) => item.key === line.item);
    const price = row ? Number(row.price) : 0;
    const quantity = /^\d+$/.test(String(line.quantity)) ? Number(line.quantity) : 0;
    const subtotal = round2(price * quantity);
    const tax = round2((subtotal * taxRate) / 100);
    return { price, subtotal, tax, total: round2(subtotal + tax) };
  };
  //totales con reduce igual que el carrito
  const totals = items.reduce(
    (acc, line) => {
      const values = lineValues(line);
      return {
        subtotal: acc.subtotal + values.subtotal,
        tax: acc.tax + values.tax,
        total: acc.total + values.total,
      };
    },
    { subtotal: 0, tax: 0, total: 0 },
  );
  //productos y servicios que ya están en alguna línea
  const used = items.map((line) => line.item);

  //asProforma dice si se guarda como proforma o se factura
  const onSubmit = (DataForm, asProforma) => {
    console.log('Formulario:');
    console.log(DataForm);
    //los precios los pone el API
    const invoice = {
      client_id: DataForm.client_id,
      items: DataForm.items.map((line) => {
        const [type, id] = line.item.split('-');
        return {
          product_id: type === 'P' ? Number(id) : null,
          service_id: type === 'S' ? Number(id) : null,
          quantity: Number(line.quantity),
        };
      }),
    };
    //si es proforma se actualiza y si no se crea
    const request = isProforma
      ? InvoiceService.issueProforma({ id: Number(id), items: invoice.items, is_proforma: asProforma })
      : InvoiceService.createInvoice({ ...invoice, is_proforma: asProforma });
    try {
      request
        .then((response) => {
          if (response.data != null) {
            //mensaje según lo que se hizo
            let mensaje = `Factura ${response.data.number} registrada a ${response.data.client_name} por ${money(response.data.total)}`;
            if (asProforma) {
              mensaje = `${response.data.number} guardada a ${response.data.client_name} por ${money(response.data.total)}`;
            } else if (isProforma) {
              mensaje = `Proforma #${id} facturada como ${response.data.number} por ${money(response.data.total)}`;
            }
            toast.success(
              mensaje,
              {
                duration: 5000,
                position: 'top-center',
              },
            );
            return navigate('/invoice');
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo registrar la factura',
            { duration: 6000 },
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      {/* con enter se guarda como proforma para no facturar por error */}
      <form onSubmit={handleSubmit((data) => onSubmit(data, true), onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              {isProforma ? `Proforma #${id}` : 'Registrar Factura'}
            </Typography>
            {proforma && proforma.appointment_id && (
              <Typography variant="body2" color="text.secondary">
                Proforma generada por la reserva #{proforma.appointment_id}.
              </Typography>
            )}
            {isProforma && (
              <Typography variant="body2" color="text.secondary">
                Puede agregar o quitar productos y servicios y guardar la proforma o facturarla.
              </Typography>
            )}
          </Grid>
          {/* encabezado de la factura */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <TextField id="date" label="Fecha" value={todayText} slotProps={{ input: { readOnly: true } }} />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <TextField
                id="branch"
                label="Sucursal"
                value={header ? header.branch : ''}
                slotProps={{ input: { readOnly: true } }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <TextField
                id="manager"
                label="Encargado"
                value={header ? header.name : ''}
                slotProps={{ input: { readOnly: true } }}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* en la proforma el cliente no se cambia */}
              {isProforma && (
                <TextField
                  id="client"
                  label="Cliente"
                  value={proforma ? `${proforma.client_name} — ${proforma.client_email}` : ''}
                  slotProps={{ input: { readOnly: true } }}
                />
              )}
              {!isProforma && loadedClients && (
                <Controller
                  name="client_id"
                  control={control}
                  render={({ field }) => <SelectClient field={field} data={dataClients} />}
                />
              )}
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.client_id ? errors.client_id.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={12} sx={{ m: 1 }}>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="Líneas de la factura">
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: '34%' }}>Producto o servicio</StyledTableCell>
                    <StyledTableCell align="right">Precio</StyledTableCell>
                    <StyledTableCell align="center" sx={{ width: 110 }}>
                      Cantidad
                    </StyledTableCell>
                    <StyledTableCell align="right">Subtotal</StyledTableCell>
                    <StyledTableCell align="right">IVA ({taxRate}%)</StyledTableCell>
                    <StyledTableCell align="right">Total</StyledTableCell>
                    <StyledTableCell align="center">Eliminar</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => {
                    const values = lineValues(items[index] || {});
                    const lineErrors = errors.items?.[index];
                    return (
                      //field id sirve de key para la fila
                      <TableRow key={field.id}>
                        <StyledTableCell>
                          <Controller
                            name={`items.${index}.item`}
                            control={control}
                            render={({ field }) => (
                              <SelectItem field={field} data={catalog} used={used} error={Boolean(lineErrors?.item)} />
                            )}
                          />
                          <FormHelperText sx={{ color: '#d32f2f' }}>
                            {lineErrors?.item ? lineErrors.item.message : ''}
                          </FormHelperText>
                        </StyledTableCell>
                        {/* al escoger el producto o servicio sale el precio */}
                        <StyledTableCell align="right">{money(values.price)}</StyledTableCell>
                        <StyledTableCell align="center">
                          <Controller
                            name={`items.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="number"
                                size="small"
                                slotProps={{ htmlInput: { min: 0, max: 999, step: 1 } }}
                                error={Boolean(lineErrors?.quantity)}
                                helperText={lineErrors?.quantity ? lineErrors.quantity.message : ''}
                                onChange={(e) => {
                                  //con cantidad 0 se quita la línea
                                  if (e.target.value !== '' && Number(e.target.value) === 0) {
                                    remove(index);
                                    toast('Se eliminó la línea (cantidad 0)');
                                  } else {
                                    field.onChange(e);
                                  }
                                }}
                              />
                            )}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="right">{money(values.subtotal)}</StyledTableCell>
                        <StyledTableCell align="right">{money(values.tax)}</StyledTableCell>
                        <StyledTableCell align="right">{money(values.total)}</StyledTableCell>
                        <StyledTableCell align="center">
                          <Tooltip title="Eliminar línea">
                            <IconButton color="error" onClick={() => remove(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </StyledTableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <StyledTableCell colSpan={3}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => append({ item: '', quantity: 1 })}
                      >
                        Agregar línea
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        Subtotal
                      </Typography>
                      {money(totals.subtotal)}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        Impuesto
                      </Typography>
                      {money(totals.tax)}
                    </StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        Total a pagar
                      </Typography>
                      {money(totals.total)}
                    </StyledTableCell>
                    <StyledTableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            {/* errores de toda la lista */}
            <FormHelperText sx={{ color: '#d32f2f', ml: 1 }}>
              {errors.items?.message || errors.items?.root?.message || ' '}
            </FormHelperText>
            {/* total en dólares en tiempo real */}
            <Box sx={{ mr: 2 }}>
              <DollarTotal total={totals.total} />
            </Box>
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="outlined" color="secondary" sx={{ m: 1 }}>
              Guardar proforma
            </Button>
            <Button
              variant="contained"
              color="secondary"
              sx={{ m: 1 }}
              onClick={handleSubmit((data) => onSubmit(data, false), onError)}
            >
              Facturar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/invoice')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
