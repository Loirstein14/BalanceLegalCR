import React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ProductService from '../../services/ProductService';
import { ListCardProducts } from './ListCardProducts';

//catálogo de productos para todos los usuarios
export function CatalogProducts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  //búsqueda vacía al inicio
  const [name, setName] = useState('');

  useEffect(() => {
    ProductService.getProducts()
      .then((response) => {
        console.log(response);
        setData(response.data);
        setError(response.error);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        if (error instanceof SyntaxError) {
          setError(error);
          setLoaded(false);
        }
      });
  }, []);

  if (!loaded) return <p>Cargando..</p>;
  if (error) return <p>Error: {error.message}</p>;

  //productos que tienen en el nombre lo que se escribió
  const filtered = data
    ? data.filter((item) => item.name.toLowerCase().includes(name.trim().toLowerCase()))
    : [];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Productos
        </Typography>
        <TextField
          size="small"
          label="Buscar producto"
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
          No hay productos con ese nombre
        </Typography>
      )}
      <ListCardProducts data={filtered} />
    </>
  );
}