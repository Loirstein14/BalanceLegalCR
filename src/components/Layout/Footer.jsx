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
        zIndex: 10, //Siempre por encima del contenido
      }}
    >
      <Container maxWidth="xl">
        <Grid container sx={{ alignItems: "center" }}>
          {/* Izquierda: universidad */}
          <Grid size={4}>
            <Typography align="left" variant="body2" sx={{ color: "common.white" }}>
              Universidad Técnica Nacional
            </Typography>
          </Grid>
          {/* Centro: proyecto, curso y año */}
          <Grid size={4}>
            <Typography align="center" variant="subtitle1" sx={{ color: "common.white" }}>
              Balance Legal CR · ISW-613
            </Typography>
            <Typography align="center" variant="body1" sx={{ color: "primaryLight.main" }}>
              {`${new Date().getFullYear()}`}
            </Typography>
          </Grid>
          {/* Derecha: autor */}
          <Grid size={4}>
            <Typography align="right" variant="body2" sx={{ color: "common.white" }}>
              Luis Solis Duran
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Toolbar>
  );
}
