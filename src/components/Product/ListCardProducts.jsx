import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import logo from '../../assets/logo.png';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Info } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

ListCardProducts.propTypes = {
  data: PropTypes.array,
};

//productos en tarjetas: imagen, nombre, categoría y precio
export function ListCardProducts({ data }) {
  //url de las imágenes que están en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data &&
        data.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                sx={{
                  backgroundColor: (theme) => theme.palette.secondary.main,
                  color: (theme) => theme.palette.common.white,
                }}
                title={item.name}
                subheader={item.category}
                slotProps={{ subheader: { sx: { color: 'grey.300' } } }}
              />
              <CardMedia
                component="img"
                height="200"
                image={item.image_path ? `${BASE_URL}/${item.image_path}` : logo} //si no tiene imagen va el logo
                alt={item.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" align="right">
                  ₡{Number(item.price).toLocaleString('es-CR')}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <Tooltip title="Ver detalle">
                  <IconButton
                    component={Link}
                    to={`/product/${item.id}`}
                    aria-label="Detalle"
                    sx={{ ml: 'auto' }}
                  >
                    <Info />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
}