import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import BalanceIcon from '@mui/icons-material/Balance';
import { Link } from 'react-router-dom';

//Lista enlaces menu principal
const navItems = [
  { name: 'Productos', link: '/product' }, //Catálogo de productos (cards)
  { name: 'Mantenimiento Productos', link: '/product-table' }, //Tabla de productos
  { name: 'Facturas', link: '/invoice' }, //Historial de facturas
  { name: 'Reservas', link: '/appointment' }, //Historial de reservas del encargado
];

export default function Header() {
  //Gestión menu principal responsivo
  const [anchorElPrincipal, setAnchorElPrincipal] = React.useState(null);

  //Abierto menu principal
  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };
  //Cerrado menu principal
  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* Menu principal responsivo (pantallas pequeñas) */}
          <IconButton
            size="large"
            color="inherit"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenPrincipalMenu}
            sx={{ mr: 1, display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElPrincipal}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            open={Boolean(anchorElPrincipal)}
            onClose={handleClosePrincipalMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {navItems.map((item, index) => (
              <MenuItem key={index} component={Link} to={item.link} onClick={handleClosePrincipalMenu}>
                <Typography sx={{ textAlign: 'center' }}>{item.name}</Typography>
              </MenuItem>
            ))}
          </Menu>

          {/* Enlace página inicio */}
          <Tooltip title="Inicio">
            <Button
              component={Link}
              to="/"
              color="inherit"
              startIcon={<BalanceIcon sx={{ color: 'primaryLight.main' }} />}
              sx={{ textTransform: 'none', mr: 2 }}
            >
              <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                Balance Legal CR
              </Typography>
            </Button>
          </Tooltip>

          {/* Menu principal (pantallas grandes) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item, index) => (
              <Button key={index} component={Link} to={item.link} color="inherit">
                {item.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
