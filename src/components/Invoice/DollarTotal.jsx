import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import ExchangeRateService from '../../services/ExchangeRateService';

DollarTotal.propTypes = {
  total: PropTypes.number,
  align: PropTypes.string,
};
//total en dólares con el tipo de cambio de Hacienda
export function DollarTotal({ total, align = 'right' }) {
  const [rate, setRate] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    ExchangeRateService.getDollar()
      .then((response) => setRate(response.data))
      .catch((error) => {
        console.log(error);
        setError(typeof error.response?.data === 'string' ? error.response.data : 'Tipo de cambio no disponible');
      });
  }, []);

  if (error) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: align }}>
        {error}
      </Typography>
    );
  }
  if (!rate) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: align }}>
        Consultando el tipo de cambio...
      </Typography>
    );
  }
  //colones entre el tipo de cambio de venta
  const dollars = total / rate.sale;
  return (
    <Box sx={{ textAlign: align }}>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Total en dólares: ${dollars.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Tipo de cambio de venta ₡
        {Number(rate.sale).toLocaleString('es-CR', { minimumFractionDigits: 2 })} del{' '}
        {format(parseISO(rate.date), 'dd/MM/yyyy')} · {rate.source}
      </Typography>
    </Box>
  );
}
