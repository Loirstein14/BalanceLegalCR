import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectClient.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
//Lista de clientes: muestra el nombre completo y el correo (se usa en reservas y facturas)
export function SelectClient({ field, data }) {
  return (
    <>
      <InputLabel id="client_id">Cliente</InputLabel>
      <Select {...field} labelId="client_id" label="Cliente" value={field.value}>
        {data &&
          data.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name} — {client.email}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
