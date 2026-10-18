import { createTheme } from '@mui/material/styles';
//Colores tomados del local de Balance Legal CR (azul de la pared) y la lavanda de la balanza del logo
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1A3D6E', //Azul de la pared del local
    },
    secondary: {
      main: '#0F2A50', //Azul más oscuro para encabezados de tarjetas y tablas
    },
    primaryLight: {
      main: '#ABB0F4', //Lavanda de la balanza del logo
      contrastText: '#1A3D6E',
    },
  },
});
