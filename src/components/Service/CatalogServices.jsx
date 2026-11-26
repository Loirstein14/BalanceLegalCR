import React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ServiceService from '../../services/ServiceService';
import { ListCardServices } from './ListCardServices';

//catálogo de servicios para todos los usuarios
export function CatalogServices() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  //filtro por nombre vacío al inicio
  const [name, setName] = useState('');

  useEffect(() => {
    ServiceService.getServices()
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

  if (!loaded) return <p>Cargando..</p>;
  if (error) return <p>Error: {error.message}</p>;

  //solo los activos y que el nombre tenga lo que se escribió
  const filtered = data
    ? data.filter(
        (item) =>
          Number(item.is_active) === 1 && item.name.toLowerCase().includes(name.trim().toLowerCase()),
      )
    : [];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Servicios
        </Typography>
        <TextField
          size="small"
          label="Buscar por nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ minWidth: 280 }}
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
      </Box>
      {filtered.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          No hay servicios con ese nombre
        </Typography>
      )}
      <ListCardServices data={filtered} />
    </>
  );
}
