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
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

// import AddSensorDialog from './components/ButtonAddSensor';
// import ComboBox from './components/AutoCompleteSearch';
import AddNodoDialog from './components/PopupAddNodo';
import AddDeviceDialog from './components/ButtonAddDevice';
import DevicesTable from './components/ContentTableSensors';
//import SensorChart from './components/DashBoard';
//import SensorFilter from './components/SensorFilter';
import AddChartButton from './components/AddChartButton';
import ChartContainer from './components/ChartContainer';
import React from 'react';

const drawerWidth = 240;

function App() {
  const [selectedMenu, setSelectedMenu] = React.useState('');
  const [charts, setCharts] = React.useState([]);
  //const [filters, setFilters] = React.useState(null);

  const handleMenuItemClick = (menu) => {
    setSelectedMenu(menu);
  };

  const handleAddChart = (chartConfig) => {
    setCharts((prevCharts) => [...prevCharts, chartConfig]);
  }

  return (
    <NodosProvider>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#282929', width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedMenu === 'Visualización en línea' && <VisibilityIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Análisis de datos' && <BarChartIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Ubicación de dispositivos' && <MapIcon sx={{ mr: 2 }} />}
              {selectedMenu === 'Gestión de sensores' && <SettingsIcon sx={{ mr: 2 }} />}
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
              {['Visualización en línea', 'Análisis de datos', 'Ubicación de dispositivos', 'Gestión de sensores'].map((text, index) => (
                <ListItem 
                  component="div"
                  key={text} 
                  selected={selectedMenu === text}
                  onClick={() => handleMenuItemClick(text)}
                  sx={{
                    cursor: 'pointer', // Para que funcione como un botón
                    '&.Mui-selected': {
                      backgroundColor: '#e0e0e0',
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
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
            }}
          >
          <Toolbar/>
          <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}>
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
                  top: 80, // Adjust this value to be below the Toolbar
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
                <Box>               
                  <ChartContainer charts={charts} />
                </Box>
                </Fade>
                )}
                  <Box>
                  <Fade in={selectedMenu === 'Gestión de sensores'} timeout={500}>
                    <Box
                    sx={{
                    position: 'absolute',
                    top: 80, // Adjust this value to be below the Toolbar
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
          <Box>
            <Fade in={selectedMenu === 'Gestión de sensores'} timeout={500}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <DevicesTable />
              </Box>
            </Fade>
          </Box>
        </Box>
      </Box>
    </NodosProvider>
  );
}

export default App;