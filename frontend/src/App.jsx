import * as React from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Button,
  Drawer,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography

} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  Visibility as VisibilityIcon,


} from '@mui/icons-material';

import SelectMedidas from './components/SelecetMedidas';
import SelectSensors from './components/SelectSensors';

const drawerWidth = 240;

export default function KogiaDashboard() {
  const [selectedMenu, setSelectedMenu] = React.useState(''); // Estado para el menú seleccionado
  const [SelectedSection, setSelectedSection] = React.useState(''); // Estado para la sección seleccionada dentro de configuración
  const [openSensors, setOpenSensors] = React.useState(false); // Estado para controlar la animación de 'Sensores'
  const [openMedidas, setOpenMedidas] = React.useState(false); // Estado para controlar la animación de 'Medidas'

  const handleMenuItemClick = (menu) => {
    setSelectedMenu(menu);
    setSelectedSection(''); // Resetear la sección cuando se cambie de menú
    setOpenMedidas(false); // Cerrar 'Medidas' cuando se cambia de menú
    setOpenSensors(false); // Cerrar 'Sensores' cuando se cambia de menú
  };

    const handleSectionClick = (section) => {
      setSelectedSection(section);
      if (section === 'Medidas') {
        setOpenMedidas(!openMedidas); // Toggle para abrir o cerrar la sección de 'Medidas'
      }
      if (section === 'Sensores') {
        setOpenSensors(!openSensors); // Toggle para abrir o cerrar la sección de 'Sensores'
      }
    };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#282929', width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedMenu === 'Visualización en línea' && <VisibilityIcon sx={{ mr: 2 }} />}
            {selectedMenu === 'Análisis de datos' && <BarChartIcon sx={{ mr: 2 }} />}
            {selectedMenu === 'Ubicación de dispositivos' && <MapIcon sx={{ mr: 2 }} />}
            {selectedMenu === 'Configuración' && <SettingsIcon sx={{ mr: 2 }} />}
            <Typography variant="h6" noWrap component="div">
              {selectedMenu ? `${selectedMenu}` : 'Configuración del sistema KOGIA'}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Typography>Usuario</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '40px'}}>
            <img src="kogiaicon.png" alt="Kogia Icon" style={{ width: '40px', height: '40px', marginRight: '8px' }} />
            <Typography variant="h7" noWrap component="div">
              Kogia
            </Typography>
          </Box>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {['Visualización en línea', 'Análisis de datos', 'Ubicación de dispositivos', 'Configuración'].map((text, index) => (
              <ListItem 
                button 
                key={text} 
                selected={selectedMenu === text}
                onClick={() => handleMenuItemClick(text)}
              >
                <ListItemIcon>
                  {index === 0 ? <VisibilityIcon /> : 
                   index === 1 ? <BarChartIcon /> : 
                   index === 2 ? <MapIcon /> : <SettingsIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
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
        <Fade in={selectedMenu === 'Configuración'} timeout={500}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Card sx={{ minWidth: 275, bgcolor: 'purple.50', flex: 1 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  Empresa
                </Typography>
                <Button variant="contained">Agregar Sensor</Button>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}







