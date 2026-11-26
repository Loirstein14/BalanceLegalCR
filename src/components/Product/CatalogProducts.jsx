import React from 'react';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import ProductService from '../../services/ProductService';
import { ListCardProducts } from './ListCardProducts';

//catálogo de productos para todos los usuarios
export function CatalogProducts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

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
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Productos
      </Typography>
      {data && <ListCardProducts data={data} />}
    </>
  );
}