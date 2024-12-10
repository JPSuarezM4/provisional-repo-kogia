import { useState } from 'react';
import {
  Typography,
  Box,
  Toolbar,
  Card,
  CardContent,
  Button,
} from '@mui/material';

const drawerWidth = 240;

export default function SensorBox() { 
    const [setOpen] = useState(false);
    const handleOpen = () => setOpen(true);


return (

<Box
component="main"
sx={{
  position: 'fixed',
  top: 0,
  left: drawerWidth, // Esto alinea el contenedor con el Drawer
  width: `calc(100% - ${drawerWidth}px)`, 
  height: '100vh', // Asegura que ocupe todo el alto de la pantalla
  p: 3,
  boxSizing: 'border-box', // Asegura que padding no afecte el ancho total
  overflowX: 'hidden',
}}
>
<Toolbar />
<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
  <Card sx={{ minWidth: 275, bgcolor: 'purple.50', flex: 1 }}>
    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary">
        Empresa
      </Typography>
      <Button variant="contained" onClick={handleOpen}>
        Agregar Sensor
      </Button>
    </CardContent>
  </Card>
</Box>
</Box>
);

}