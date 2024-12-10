import * as React from 'react';
import {
  AppBar,
  Box,
  // Card,
  // CardContent,
  Drawer,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,

} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  Visibility as VisibilityIcon,



} from '@mui/icons-material';

import AddSensorDialog from './components/PopupAddSensor';
// import EditSensorDialog from './components/PopupEditSensor'; 
import ComboBox from './components/AutoCompleteSearch';
import SensorsTable from './components/ContentTable';


const drawerWidth = 240;

export default function KogiaDashboard() {
  const [selectedMenu, setSelectedMenu] = React.useState('');


  const handleMenuItemClick = (menu) => {
    setSelectedMenu(menu);
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
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 5 }} > 
          <Typography variant="h7" noWrap component="div">
            Koral AT 
          </Typography>
        </Box>
      </Drawer>
      <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${drawerWidth}px)`,
            // mt: 8, // Add margin top to push content below the AppBar
          }}
        >
        <Toolbar/>
        <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}>
          <Fade in={selectedMenu === 'Configuración'} timeout={500}>
            <Box>
              <ComboBox /> 
            </Box>
          </Fade>
        </Box>
        <Box>
          <Fade in={selectedMenu === 'Configuración'} timeout={500}>
            <Box
              sx={{
                position: 'fixed',
                top: 16,
                right: 16,
                justifyContent: 'center',
              }}
            >
              <AddSensorDialog />
            </Box>
          </Fade>
        </Box>
        <Box>
          <Fade in={selectedMenu === 'Configuración'} timeout={500}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              <SensorsTable />
            </Box>
          </Fade>
        </Box>

      </Box>
    </Box>
  );
}










