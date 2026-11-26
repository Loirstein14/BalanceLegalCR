import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import { Info } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

ListCardServices.propTypes = {
  data: PropTypes.array,
};

//servicios en tarjetas
export function ListCardServices({ data }) {
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
                subheader={item.modality_name}
                slotProps={{ subheader: { sx: { color: 'grey.300' } } }}
              />
              {/* si no tiene imagen va el mazo igual que en el detalle */}
              {item.image_path ? (
                <CardMedia component="img" height="200" image={`${BASE_URL}/${item.image_path}`} alt={item.name} />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GavelIcon sx={{ fontSize: 80 }} />
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">
                    {item.duration_minutes / 60} {item.duration_minutes === 60 ? 'hora' : 'horas'}
                  </Typography>
                </Box>
                <Typography variant="h6">₡{Number(item.price).toLocaleString('es-CR')}</Typography>
              </CardContent>
              <CardActions disableSpacing>
                <Tooltip title="Ver detalle">
                  <IconButton
                    component={Link}
                    to={`/service/${item.id}`}
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
