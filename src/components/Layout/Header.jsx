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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ListSubheader from '@mui/material/ListSubheader';
import { Link } from 'react-router-dom';
import logoBlanco from '../../assets/logo-balance-legal-blanco.png';

//enlaces del menú principal
const navItems = [
  { name: 'Productos', link: '/product' }, //catálogo en cards
  { name: 'Servicios', link: '/service' },
  { name: 'Facturas', link: '/invoice' },
  { name: 'Reservas', link: '/appointment' },
];

//submenú de mantenimientos
const maintenanceItems = [
  { name: 'Productos', link: '/product-table' },
  { name: 'Servicios', link: '/service-table' },
  { name: 'Sucursales', link: '/branch-table' },
  { name: 'Horarios', link: '/schedule-table' },
  { name: 'Bloqueos', link: '/block-table' },
];

export default function Header() {
  //menú principal responsivo
  const [anchorElPrincipal, setAnchorElPrincipal] = React.useState(null);

  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };
  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };

  //abrir y cerrar el submenú
  const [anchorElMaintenance, setAnchorElMaintenance] = React.useState(null);
  const handleCloseMaintenanceMenu = () => {
    setAnchorElMaintenance(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* menú para pantallas pequeñas */}
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
            <ListSubheader>Mantenimientos</ListSubheader>
            {maintenanceItems.map((item) => (
              <MenuItem key={item.link} component={Link} to={item.link} onClick={handleClosePrincipalMenu}>
                <Typography sx={{ textAlign: 'center' }}>{item.name}</Typography>
              </MenuItem>
            ))}
          </Menu>

          <Tooltip title="Inicio">
            <Button
              component={Link}
              to="/"
              color="inherit"
              startIcon={<Box component="img" src={logoBlanco} alt="Logo Balance Legal CR" sx={{ width: 36, height: 36 }} />}
              sx={{ textTransform: 'none', mr: 2 }}
            >
              <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                Balance Legal CR
              </Typography>
            </Button>
          </Tooltip>

          {/* menú para pantallas grandes */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item, index) => (
              <Button key={index} component={Link} to={item.link} color="inherit">
                {item.name}
              </Button>
            ))}
            <Button
              color="inherit"
              endIcon={<ArrowDropDownIcon />}
              aria-controls="menu-maintenance"
              aria-haspopup="true"
              onClick={(event) => setAnchorElMaintenance(event.currentTarget)}
            >
              Mantenimientos
            </Button>
            <Menu
              id="menu-maintenance"
              anchorEl={anchorElMaintenance}
              open={Boolean(anchorElMaintenance)}
              onClose={handleCloseMaintenanceMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {maintenanceItems.map((item) => (
                <MenuItem key={item.link} component={Link} to={item.link} onClick={handleCloseMaintenanceMenu}>
                  {item.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
