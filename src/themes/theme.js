import { createTheme } from '@mui/material/styles';
//Colores del logo de Balance Legal CR (azul de fondo y lavanda de la balanza)
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0001B4', //Azul del logo
    },
    secondary: {
      main: '#1B1F6B', //Azul oscuro para encabezados
    },
    primaryLight: {
      main: '#ABB0F4', //Lavanda del logo
      contrastText: '#0001B4',
    },
  },
});
