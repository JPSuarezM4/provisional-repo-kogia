import React, { useState } from 'react';
import { NodosProvider } from './context/NodosContext';
import {
  AppBar,
  Box,
  Drawer,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Build as BuildIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

import AddNodoDialog from './components/PopupAddNodo';
import AddDeviceDialog from './components/ButtonAddDevice';
import DevicesTable from './components/ContentTableSensors';
import AddChartButton from './components/AddChartButton';
import ChartContainer from './components/ChartContainer';
import MeasurementList from './components/MeasurmentList';
import RealTimeChart from './components/RealTimeChart';

const drawerWidth = 240;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [charts, setCharts] = useState([]);
  const [realTimeCharts, setRealTimeCharts] = useState([]);
  const [gestionAnchorEl, setGestionAnchorEl] = useState(null);

  const handleMenuItemClick = (menu) => {
    setSelectedMenu(menu);
  };

  const handleAddChart = (chartConfig) => {
    setCharts((prevCharts) => [...prevCharts, chartConfig]);
  };

  const handleAddRealTimeChart = (chartConfig) => {
    setRealTimeCharts((prevCharts) => [...prevCharts, chartConfig]);
  };

  const handleGestionClick = (event) => {
    setGestionAnchorEl(event.currentTarget);
  };

  const handleGestionClose = () => {
    setGestionAnchorEl(null);
  };
  

  return (
    <NodosProvider>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#282929', width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedMenu === 'Análisis de datos' && <BarChartIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Ubicación de dispositivos' && <MapIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Gestión de sensores' && <SettingsIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Análisis de datos en tiempo real' && <TimelineIcon sx={{ mr: 2 }} />}
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
              {/* Análisis de datos en tiempo real */}
              <ListItem 
                component="div"
                selected={selectedMenu === 'Análisis de datos en tiempo real'}
                onClick={() => handleMenuItemClick('Análisis de datos en tiempo real')}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: '#e0e0e0',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText primary="Análisis de datos en tiempo real" />
              </ListItem>

              {/* Análisis de datos históricos */}
              <ListItem 
                component="div"
                selected={selectedMenu === 'Análisis de datos'}
                onClick={() => handleMenuItemClick('Análisis de datos')}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: '#e0e0e0',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="Análisis de datos históricos" />
              </ListItem>

              {/* Gestión de sensores */}
              <ListItem 
                component="div"
                selected={selectedMenu === 'Gestión de sensores'}
                onClick={() => handleMenuItemClick('Gestión de sensores')}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: '#e0e0e0',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión de sensores" />
              </ListItem>

              {/* Gestión */}
              <ListItem
                component="div"
                onClick={handleGestionClick}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión" />
                <ExpandMoreIcon />
              </ListItem>
              <Menu
                anchorEl={gestionAnchorEl}
                open={Boolean(gestionAnchorEl)}
                onClose={handleGestionClose}
              >
                <MenuItem onClick={() => { handleMenuItemClick('Gestión de lista de medidas'); handleGestionClose(); }}>Gestión de lista de medidas</MenuItem>
                <MenuItem onClick={() => { handleMenuItemClick('Gestión de usuarios'); handleGestionClose(); }}>Gestión de usuarios</MenuItem>
                <MenuItem onClick={() => { handleMenuItemClick('Gestión de dispositivos'); handleGestionClose(); }}>Gestión de dispositivos</MenuItem>
              </Menu>

              {/* Comentados */}
              {/* Ubicación de dispositivos */}
              {/*
              <ListItem 
                component="div"
                selected={selectedMenu === 'Ubicación de dispositivos'}
                onClick={() => handleMenuItemClick('Ubicación de dispositivos')}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: '#e0e0e0',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <MapIcon />
                </ListItemIcon>
                <ListItemText primary="Ubicación de dispositivos" />
              </ListItem>
              */}
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
          }}
        >
          <Toolbar/>
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Fade in={selectedMenu === 'Gestión de sensores'} timeout={500}>
              <Box>
                {/* <ComboBox /> */}    
              </Box>
            </Fade>
          </Box>
          {selectedMenu === 'Análisis de datos' && (
            <Box
              sx={{
                position: 'absolute',
                top: 80,
                right: 15,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Fade in={selectedMenu === 'Análisis de datos'} timeout={500}>
                <Box>
                  <AddChartButton onAddChart={handleAddChart} />
                </Box>
              </Fade>
            </Box>
          )}
          {selectedMenu === 'Análisis de datos' && (
            <Fade in={selectedMenu === 'Análisis de datos'} timeout={500}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: 4, 
                width: '100%', 
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                <ChartContainer charts={charts} />
              </Box>
            </Fade>
          )}
{selectedMenu === 'Análisis de datos en tiempo real' && (
    <React.Fragment>
        <Box
            sx={{
                position: 'absolute',
                top: 80,
                right: 15,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Fade in={selectedMenu === 'Análisis de datos en tiempo real'} timeout={500}>
                <Box>
                    <AddChartButton onAddChart={handleAddRealTimeChart} />
                </Box>
            </Fade>
        </Box>
        <Fade in={selectedMenu === 'Análisis de datos en tiempo real'} timeout={500}>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 4,
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                {realTimeCharts.map((chartConfig, index) => (
                    <RealTimeChart
                        key={index}
                        nodo_id={chartConfig.nodo_id}
                        dispositivo_id={chartConfig.dispositivo_id}
                        sensor_id={chartConfig.sensor_id}
                        medida_id={chartConfig.medida_id}
                    />
                ))}
            </Box>
        </Fade>
    </React.Fragment>
)}
          <Box>
            <Fade in={selectedMenu === 'Gestión de sensores' && <BuildIcon sx={{ mr: 2 }} />}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 80,
                  right: 15,
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <AddNodoDialog />
                <AddDeviceDialog />
              </Box>
            </Fade>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {selectedMenu === 'Gestión de sensores' && (
              <Fade in timeout={500}>
                <Box>
                  <DevicesTable />
                </Box>
              </Fade>
            )}
            {selectedMenu === 'Gestión de lista de medidas' && (
              <Fade in timeout={500}>
                <Box sx={{ marginTop: '20px', width: '100%' }}>
                  <MeasurementList />
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </Box>
    </NodosProvider>
  );
}

export default App;
