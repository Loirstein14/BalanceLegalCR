import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectBranchService.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
//servicios de la sucursal, con la duración y el precio
export function SelectBranchService({ field, data }) {
  //60 -> '1 hora', 120 -> '2 horas'
  const duration = (minutes) => {
    const hours = minutes / 60;
    return hours === 1 ? '1 hora' : hours + ' horas';
  };
  return (
    <>
      <InputLabel id="service_id">Servicio</InputLabel>
      <Select {...field} labelId="service_id" label="Servicio" value={field.value}>
        {data &&
          data.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name} · {duration(service.duration_minutes)} · ₡
              {Number(service.price).toLocaleString('es-CR')}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
