// eslint-disable-next-line no-unused-vars
import React from "react"; 
import { Container, Typography } from "@mui/material"; 
import Grid from "@mui/material/Grid"; 
import Toolbar from "@mui/material/Toolbar"; 
export function Footer() { 
  return ( 
    <Toolbar 
      sx={{ 
        px: 2, 
        position: "fixed", 
        bottom: 0, 
        width: "100%", 
        height: "4.5rem", 
        backgroundColor: "primary.main", 
        paddingTop: "1rem", 
        paddingBottom: "1rem", 
      }} 
    > 
      {/* Comentario */} 
      <Container> 
        <Grid container rowSpacing={1}> 
          <Grid size={12}> 
            <Typography align="center" variant="subtitle1" sx={{ color: 'common.white' }}> 
              Balance Legal CR · ISW-613 
            </Typography> 
          </Grid> 
          <Grid size={12}> 
            <Typography align="center" variant="body1" sx={{ color: 'primaryLight.main' }}> 
              {`${new Date().getFullYear()}`} 
            </Typography> 
          </Grid> 
        </Grid> 
      </Container> 
    </Toolbar> 
  ); 
} 
