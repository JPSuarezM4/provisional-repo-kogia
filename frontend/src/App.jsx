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
  IconButton,
  Collapse,

} from '@mui/material';
import {
  Build as BuildIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Devices as DevicesIcon,
  ListAlt as ListAltIcon,
  AutoAwesomeMosaic as AutoAwesomeMosaicIcon
} from '@mui/icons-material';

import AddNodoDialog from './components/PopupAddNodo';
import AddDeviceDialog from './components/ButtonAddDevice';
import DevicesTable from './components/ContentTableSensors';
import AddChartButton from './components/AddChartButton';
import ChartContainer from './components/ChartContainer';
import MeasurementList from './components/MeasurmentList';
import RealTimeChart from './components/RealTimeChart';
import {Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';


const drawerWidth = 240;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [charts, setCharts] = useState([]);
  const [realTimeCharts, setRealTimeCharts] = useState([]);
  const [isGestionOpen, setIsGestionOpen] = useState(false); // Cambia a un booleano

  const handleMenuItemClick = (menu) => {
    setSelectedMenu(menu);
  };

  const handleAddChart = (chartConfig) => {
    setCharts((prevCharts) => [...prevCharts, chartConfig]);
  };

  const handleAddRealTimeChart = (chartConfig) => {
    if (realTimeCharts.length >= 4) {
      alert("No puedes agregar más de 4 gráficos en tiempo real.");
      return;
    }   
    setRealTimeCharts((prevCharts) => [...prevCharts, chartConfig]);
  };

  const handleGestionClick = () => {
    setIsGestionOpen((prev) => !prev); // Alterna el estado
  };


  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token
    window.location.href = '/login'; // Redirige al login
  };
  
  const MainApp = () => {
    return (
    <NodosProvider>
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#282929', width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, borderBottom: '1px solid #d6d6d6'}}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedMenu === 'Análisis de datos' && <BarChartIcon sx={{ mr: 2 }} />}
            {selectedMenu === 'Ubicación de dispositivos' && <MapIcon sx={{ mr: 2 }} />}
            {selectedMenu === 'Gestión de sensores' && <SettingsIcon sx={{ mr: 2 }} />}
            {selectedMenu === 'Análisis de datos en tiempo real' && <TimelineIcon sx={{ mr: 2 }} />}
            <Typography
              variant="subtitle1" // Cambia el tamaño del texto
              noWrap
              component="div"
              sx={{ fontSize: '0.875rem' }} // Ajusta el tamaño del texto
            >
              {selectedMenu ? `${selectedMenu}` : 'Bienvenido a Kogia'}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={() => {
              // Espacio para lógica futura
              console.log('Notificaciones clickeadas');
            }}
            sx={{ fontSize: '1.25rem', mr: 2 }} // Ajusta el tamaño y agrega margen derecho
          >
            <NotificationsIcon /> {/* Ícono de notificaciones */}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleLogout} // Llama a la función de logout
            sx={{ fontSize: '1.25rem' }} // Ajusta el tamaño del ícono
          >
            <LogoutIcon /> {/* Ícono de logout */}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #d6d6d6'},
        }}
      >
        <Toolbar    
          sx={{
              borderBottom: '1px solid #d6d6d6', // Borde inferior que delimita el nombre y el ícono
            }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '40px'}}>
            <img src="kogiaiconv2.png" alt="Kogia Icon" style={{ width: '40px', height: '40px', marginRight: '8px' }} />
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
                  <AutoAwesomeMosaicIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión de sensores" />
              </ListItem>

            {/* Gestión */}
            <ListItem
              component="div"
              onClick={handleGestionClick} // Alterna el estado del menú
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
              <ExpandMoreIcon
                sx={{
                  transform: isGestionOpen ? 'rotate(180deg)' : 'rotate(0deg)', // Rota el ícono según el estado
                  transition: 'transform 0.3s ease',
                }}
              />
            </ListItem>

            {/* Menú desplegable dentro del Drawer */}
            <Collapse in={isGestionOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  component="div"
                  sx={{
                    pl: 4, // Indentado
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => handleMenuItemClick('Gestión de lista de medidas')}
                >
                  <ListItemIcon>
                    <ListAltIcon /> {/* Ícono para "Gestión de lista de medidas" */}
                  </ListItemIcon>
                  <ListItemText primary="Gestión de lista de medidas" />
                </ListItem>
                <ListItem
                  component="div"
                  sx={{
                    pl: 4, // Indentado
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => console.log('Gestión de usuarios')}
                >
                  <ListItemIcon>
                    <PeopleIcon /> {/* Ícono para "Gestión de usuarios" */}
                  </ListItemIcon>
                  <ListItemText primary="Gestión de usuarios" />
                </ListItem>
                <ListItem
                  component="div"
                  sx={{
                    pl: 4, // Indentado
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => console.log('Gestión de dispositivos')}
                >
                  <ListItemIcon>
                    <DevicesIcon /> {/* Ícono para "Gestión de dispositivos" */}
                  </ListItemIcon>
                  <ListItemText primary="Gestión de dispositivos" />
                </ListItem>
              </List>
            </Collapse>

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 5, borderTop: '1px solid #d6d6d6'}} > 
          <Typography noWrap component="div" sx={{ fontSize: '0.875rem', color: '#373939', mt: 2}}>
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
              bottom: 90,
              right: 20,
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
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 3,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
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
                      bottom: 90,
                      right: 20,
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
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 3,
                          justifyContent: 'center',
                          alignItems: 'center',
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
          };


      return (
            <Routes>
                {/* Ruta para el login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta protegida para la aplicación principal */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainApp />
                        </ProtectedRoute>
                    }
                />
            </Routes>
      );
    }
export default App;
