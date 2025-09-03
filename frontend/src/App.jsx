import { useState } from 'react';
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
 // Build as BuildIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Science as ScienceIcon,
  Build as BuildIcon,
// Devices as DevicesIcon,
  ListAlt as ListAltIcon,
  AutoAwesomeMosaic as AutoAwesomeMosaicIcon
} from '@mui/icons-material';

import AddNodoDialog from './components/PopupAddNodo';
import AddDeviceDialog from './components/ButtonAddDevice';
import DevicesTable from './components/ContentTableSensors';
import AddChartButton from './components/AddChartButton';
import AddBoxPlotButton from './components/AddBoxPlotButton';
import ChartContainer from './components/ChartContainer';
import BoxPlotContainer from './components/BoxPlotContainer';
import MeasurementList from './components/MeasurmentList';
import RealTimeChart from './components/RealTimeChart';
import RealTimeGauge from './components/RealTimeGauge';
import {Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import UserManagement from './components/UsersManagement';
import ProtectedRoute from './components/ProtectedRoute';
import ExportButton from './components/ExportButton';


const drawerWidth = 240;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [charts, setCharts] = useState([]);
  const [realTimeCharts, setRealTimeCharts] = useState([]);
  const [realTimeGauge, setRealTimeGauge] = useState([]); // Estado para el gráfico en tiempo real
  const [isGestionOpen, setIsGestionOpen] = useState(false); // Cambia a un booleano
  const userRole = localStorage.getItem('role');
  const [selectedBoxPlots, setSelectedBoxPlots] = useState([]); // [{id, data, tipoProcesamiento}]

 {/* const handleMenuItemClick = (menu) => {
    setSelectedMenu(menu);
  }; */}

  const handleAddChart = (chartConfig) => {
    setCharts((prevCharts) => [
      ...prevCharts,
      { ...chartConfig, id: Date.now() + Math.random() } // id único
    ]);
  };

    const handleAddBoxPlot = (chartConfig) => {
    setCharts((prevCharts) => [
      ...prevCharts,
      { ...chartConfig, id: Date.now() + Math.random() } // id único
    ]);
  };

  const handleDeleteChart = (id) => {
  setCharts(prev => prev.filter(chart => chart.id !== id));
  };



  const handleDeleteRealTimeGauge = (index) => {
    setRealTimeGauge(prev => prev.filter((_, i) => i !== index));
  };


const handleAddRealTimeChart = (chartConfig) => {
  if (chartConfig.chartType === 'line') {
    if (realTimeCharts.length >= 4) {
      alert("No puedes agregar más de 4 gráficos en tiempo real.");
      return;
    }
    setRealTimeCharts((prevCharts) => [...prevCharts, chartConfig]);
  } else if (chartConfig.chartType === 'gauge') {
    if (realTimeGauge.length >= 4) {
      alert("No puedes agregar más de 4 gráficos en tiempo real de gauge.");
      return;
    }
    setRealTimeGauge((prevCharts) => [...prevCharts, chartConfig]);
  } else {
    alert("Tipo de gráfico no válido.");
  }
};

  const handleDeleteRealTimeChart = (index) => {
    setRealTimeCharts(prev => prev.filter((_, i) => i !== index));
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
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#121212' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: '#282929',
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            borderBottom: '1px solid #d6d6d6',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedMenu === 'Análisis de datos' && <BarChartIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Modelado' && <ScienceIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Procesamiento' && <BuildIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Ubicación de dispositivos' && <MapIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Gestión de sensores' && <SettingsIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Análisis de datos en tiempo real' && <TimelineIcon sx={{ mr: 2 }} />}
              <Typography variant="subtitle1" noWrap sx={{ fontSize: '0.875rem' }}>
                {selectedMenu || 'Bienvenido a Kogia'}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton color="inherit" onClick={() => console.log('Notificaciones clickeadas')} sx={{ mr: 2 }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer lateral */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #d6d6d6',
            },
          }}
        >
          {/* Logo y nombre */}
          <Toolbar sx={{ borderBottom: '1px solid #d6d6d6' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: '40px' }}>
              <img src="kogiaiconv2.png" alt="Kogia Icon" style={{ width: 40, height: 40, marginRight: 8 }} />
              <Typography variant="h7" noWrap>Kogia</Typography>
            </Box>
          </Toolbar>

          {/* Menú */}
          <List>
            {/* Opción: Tiempo real */}
            <ListItem selected={selectedMenu === 'Análisis de datos en tiempo real'} onClick={() => setSelectedMenu('Análisis de datos en tiempo real')} button>
              <ListItemIcon><TimelineIcon /></ListItemIcon>
              <ListItemText primary="Análisis de datos en tiempo real" />
            </ListItem>

            {/* Opción: Históricos */}
            <ListItem selected={selectedMenu === 'Análisis de datos'} onClick={() => setSelectedMenu('Análisis de datos')} button>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Análisis de datos históricos" />
            </ListItem>

            {/* Opción: Gestión de sensores */}
            <ListItem selected={selectedMenu === 'Gestión de sensores'} onClick={() => setSelectedMenu('Gestión de sensores')} button>
              <ListItemIcon><AutoAwesomeMosaicIcon /></ListItemIcon>
              <ListItemText primary="Gestión de sensores" />
            </ListItem>
            
            {/* Opción:  Procesamiento */}
            <ListItem selected={selectedMenu === 'Procesamiento'} onClick={() => setSelectedMenu('Procesamiento')} button>
              <ListItemIcon><PeopleIcon/></ListItemIcon>
              <ListItemText primary="Procesamiento" />
            </ListItem>

            {/* Opción: Modelado */}
            <ListItem selected={selectedMenu === 'Modelado'} onClick={() => setSelectedMenu('Modelado')} button>
              <ListItemIcon><ScienceIcon/></ListItemIcon>
              <ListItemText primary="Modelado" />
            </ListItem>

            {/* Submenú Gestión */}
            <ListItem onClick={handleGestionClick} button>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Gestión" />
              <ExpandMoreIcon sx={{ transform: isGestionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s ease' }} />
            </ListItem>

            <Collapse in={isGestionOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem sx={{ pl: 4 }} button onClick={() => setSelectedMenu('Gestión de lista de medidas')}>
                  <ListItemIcon><ListAltIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de lista de medidas" />
                </ListItem>
              
                {userRole === 'admin' && (
                  <ListItem
                    sx={{ pl: 4 }}
                    button
                    selected={selectedMenu === 'Gestión de usuarios'}
                    onClick={() => setSelectedMenu('Gestión de usuarios')}
                  >
                    <ListItemIcon><PeopleIcon /></ListItemIcon>
                    <ListItemText primary="Gestión de usuarios" />
                  </ListItem>
                )}
                {/* <ListItem sx={{ pl: 4 }} button>
                  <ListItemIcon><DevicesIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de dispositivos" />
                </ListItem> */}
              </List>
            </Collapse>
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', mb: 5, borderTop: '1px solid #d6d6d6' }}>
            <Typography sx={{ fontSize: '0.875rem', color: '#373939', mt: 2 }}>Koral AT</Typography>
          </Box>
        </Drawer>

        {/* CONTENIDO PRINCIPAL */}
        <Box
        component="main"
        sx={{
          flex: 1,
          p: 3,
          overflowY: 'auto'
        }}
      >
          <Toolbar />

          {/* GESTIÓN DE SENSORES */}
          {selectedMenu === 'Gestión de sensores' && (
            <>
              <Box sx={{ position: 'absolute', top: 80, right: 15, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AddNodoDialog />
                <AddDeviceDialog />
              </Box>
              <Fade in timeout={500}>
                <Box>
                  <DevicesTable />
                </Box>
              </Fade>
            </>
          )}

          {/* GESTIÓN DE LISTA DE MEDIDAS */}
          {selectedMenu === 'Gestión de lista de medidas' && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 3 }}>
                <MeasurementList />
              </Box>
            </Fade>
          )}

          {/* ANÁLISIS DE DATOS HISTÓRICOS */}
          {selectedMenu === 'Análisis de datos' && (
            <>
              <Box sx={{ position: 'absolute', bottom: 90, right: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AddChartButton onAddChart={handleAddChart} />
              </Box>
              <Fade in timeout={500}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 3,
                  maxWidth: '1200px',
                  margin: '0 auto',
                }}>
                  <ChartContainer charts={charts} onDeleteChart={handleDeleteChart} />
                </Box>
              </Fade>
            </>
          )}

          {/* Opción: Procesamiento */}
          {selectedMenu === 'Procesamiento' && (
            <>
              <ExportButton
                disabled={selectedBoxPlots.length === 0}
                onExport={() => {
                  // Aquí exportas todos los datos seleccionados
                  console.log("Exportando datos seleccionados:", selectedBoxPlots);
                  // Puedes descargar como CSV, enviar a backend, etc.
                }}
              />
              <Box sx={{ position: 'absolute', bottom: 90, right: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AddBoxPlotButton onAddChart={handleAddBoxPlot} />
              </Box>
              <Fade in timeout={500}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 3,
                  maxWidth: '1200px',
                  margin: '0 auto',
                }}>
                  <BoxPlotContainer
                    charts={charts}
                    onDeleteChart={handleDeleteChart}
                    onSelectBoxPlot={(id, selected, processedData, processingType) => {
                      setSelectedBoxPlots(prev => {
                        if (selected) {
                          const filtered = prev.filter(item => item.id !== id);
                          return [...filtered, { id, data: processedData, tipoProcesamiento: processingType }];
                        } else {
                          return prev.filter(item => item.id !== id);
                        }
                      });
                    }}
                  />
                </Box>
              </Fade>
            </>
          )}




          {/* ANÁLISIS DE DATOS EN TIEMPO REAL */}
          {selectedMenu === 'Análisis de datos en tiempo real' && (
            <>
              <Box sx={{ position: 'absolute', bottom: 90, right: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AddChartButton onAddChart={handleAddRealTimeChart} />
              </Box>
              <Fade in timeout={500}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 3,
                  maxWidth: '1200px',
                  margin: '0 auto',
                }}>
                  {realTimeCharts.map((config, i) => (
                    <RealTimeChart
                      key={i}
                      {...config}
                      onDelete={() => handleDeleteRealTimeChart(i)}
                    />
                  ))}
                  {realTimeGauge.map((config, i) => (
                    <RealTimeGauge
                      key={i}
                      {...config}
                      onDelete={() => handleDeleteRealTimeGauge(i)}
                    />
                  ))}
                </Box>
              </Fade>
            </>
          )}

          {/* GESTIÓN DE USUARIOS */}
          {selectedMenu === 'Gestión de usuarios' && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 3 }}>
                <UserManagement />
              </Box>
            </Fade>
          )}
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
