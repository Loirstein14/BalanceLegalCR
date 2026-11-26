import { createTheme } from '@mui/material/styles';
//colores sacados del local (el azul de la pared) y la lavanda de la balanza del logo
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1A3D6E', //azul de la pared del local
    },
    secondary: {
      main: '#0F2A50', //azul más oscuro para encabezados de tarjetas y tablas
    },
    primaryLight: {
      main: '#ABB0F4', //lavanda de la balanza del logo
      contrastText: '#1A3D6E',
    },
  },
});
