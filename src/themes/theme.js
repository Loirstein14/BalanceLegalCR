import { createTheme } from '@mui/material/styles'; 
export const appTheme= createTheme  ({ 
  palette: { 
    mode: 'light', 
    primary: { 
      main: '#468B97', 
    }, 
    secondary: { 
      main: '#1D5B79', 
    }, 
    primaryLight: { 
        main: "#95C7DE", 
        contrastText: "#F3AA60"  
      } 
  }, 
});
