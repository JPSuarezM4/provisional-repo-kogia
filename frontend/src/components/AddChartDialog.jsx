import { useState, useContext } from 'react';
import { NodosContext } from '../context/NodosContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Fab,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  Drawer
} from '@mui/material';
import AddChartIcon from '@mui/icons-material/AddChart';
import SensorChart from './AddChart';




  



export default function AddChartDialog() {

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nodo_id: '',
    nombre_nodo: '',
    dispositivos: [],
    dispositivo_id: '',
    sensores: [],
    sensor_id: '',
    medidas: [],
    medida_id: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { nodos } = useContext(NodosContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleNodoChange = (nodo_id) => {
    const selectedNodo = nodos.find((nodo) => nodo.nodo_id === nodo_id);
    setFormData({
      nodo_id: parseInt(nodo_id, 10),
      nombre_nodo: selectedNodo ? selectedNodo.nombre_nodo : '',
      dispositivos: selectedNodo?.dispositivos || [],
      dispositivo_id: '',
      sensores: [],
      sensor_id: '',
      medidas: [],
      medida_id: '',
    });
  };

  const handleDispositivoChange = (dispositivo_id) => {
    const selectedNodo = nodos.find((nodo) => nodo.nodo_id === formData.nodo_id);
    if (!selectedNodo) {
      console.warn("⚠️ Nodo no encontrado");
      return;
    }

    const selectedDispositivo = selectedNodo.dispositivos?.find(
      (dispositivo) => dispositivo.dispositivo_id === parseInt(dispositivo_id, 10)
    );

    if (!selectedDispositivo) {
      console.warn("⚠️ Dispositivo no encontrado");
      return;
    }
    

    setFormData((prev) => ({
      ...prev,
      dispositivos: selectedNodo.dispositivos || [],
      dispositivo_id: parseInt(dispositivo_id, 10),
      sensores: selectedDispositivo.sensor ? [...selectedDispositivo.sensor] : [],
      sensor_id: '',
    }));
  };

  const handleSensorChange = (sensor_id) => {
    const selectedDispositivo = formData.dispositivos.find(
      (dispositivo) => dispositivo.dispositivo_id === formData.dispositivo_id
    );
  
    if (!selectedDispositivo) {
      console.warn("⚠️ Dispositivo no encontrado");
      return;
    }
  
    const selectedSensor = selectedDispositivo.sensor.find(
      (sensor) => sensor.sensor_id === parseInt(sensor_id, 10)
    );
  
    if (!selectedSensor) {
      console.warn("⚠️ Sensor no encontrado");
      return;
    }
  
    setFormData((prev) => ({
      ...prev,
      sensor_id: parseInt(sensor_id, 10),
      medidas: selectedSensor.medidas || [],
      medida_id: '',
    }));
  };
  

  const handleMedidaChange = (medida_id) => {
    setFormData((prev) => ({
      ...prev,
      medida_id: parseInt(medida_id, 10),
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [showChart, setShowChart] = useState(false);

  const handleCreateChart = () => {
    setShowChart(true);
    setSnackbar({ open: true, message: 'Gráfico creado exitosamente', severity: 'success' });
  };

  return (
    <Box>
      <Tooltip title="Agregar nuevo grafico">
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <AddChartIcon />
        </Fab>
      </Tooltip>
      <Drawer open={open} anchor='bottom' onClose={toggleDrawer(false)}>
        <DialogTitle>Crear nuevo gráfico</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Seleccionar Nodo"
            value={formData.nodo_id}
            onChange={(e) => handleNodoChange(e.target.value)}
            fullWidth
            margin="normal"
          >
            {nodos.length > 0 ? (
              nodos.map((nodo) => (
                <MenuItem key={nodo.nodo_id} value={nodo.nodo_id}>
                  {nodo.nombre_nodo}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Cargando nodos...</MenuItem>
            )}
          </TextField>

          <TextField
            select
            label="Seleccionar Dispositivo"
            value={formData.dispositivo_id || ""}
            onChange={(e) => handleDispositivoChange(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!formData.nodo_id}
          >
            {formData.nodo_id && formData.dispositivos.length > 0 ? (
              formData.dispositivos.map((dispositivo) => (
                <MenuItem key={dispositivo.dispositivo_id} value={dispositivo.dispositivo_id}>
                  {dispositivo.nombre}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Selecciona un nodo primero</MenuItem>
            )}
          </TextField>

          <TextField
            select
            label="Seleccionar Sensor"
            value={formData.sensor_id || ""}
            onChange={(e) => handleSensorChange(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!formData.dispositivo_id}
          >
            {formData.dispositivo_id && formData.sensores.length > 0 ? (
              formData.sensores.map((sensor) => (
                <MenuItem key={sensor.sensor_id} value={sensor.sensor_id}>
                  {sensor.nombre}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Selecciona un dispositivo primero</MenuItem>
            )}
          </TextField>
          <TextField
            select
            label="Seleccionar medida"
            value={formData.medida_id || ""}
            onChange={(e) => handleMedidaChange(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!formData.sensor_id}
          >
            {formData.sensor_id && formData.medidas.length > 0 ? (
              formData.medidas.map((medida) => (
                <MenuItem key={medida.medida_id} value={medida.medida_id}>
                  {medida.unidad}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Selecciona un sensor primero</MenuItem>
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={() => { handleCreateChart(); toggleDrawer(false)(); }}>
            Crear Gráfico
          </Button>
        </DialogActions>
      </Drawer>
      {showChart && formData.nodo_id && formData.dispositivo_id && formData.sensor_id && (
        <SensorChart 
          nodo_id={String(formData.nodo_id)} 
          dispositivo_id={String(formData.dispositivo_id)} 
          sensor_id={String(formData.sensor_id)} 
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
