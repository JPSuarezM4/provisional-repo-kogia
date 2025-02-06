import { useState, useContext } from 'react';
import { NodosContext } from '../context/NodosContext';
import {
  Button,
  Dialog,
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
} from '@mui/material';
import AddChartIcon from '@mui/icons-material/AddChart';
import SensorChart from './AddChart'; // Asegúrate de importar el componente SensorChart

export default function AddChartDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nodo_id: '',
    nombre_nodo: '',
    dispositivos: [],
    dispositivo_id: '',
    sensores: [],
    sensor_id: '',
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
    setFormData((prev) => ({
      ...prev,
      sensor_id: parseInt(sensor_id, 10),
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
      <Tooltip title="Agregar Nuevo Grafico">
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <AddChartIcon />
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Crear Nuevo Gráfico</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreateChart}>
            Crear Gráfico
          </Button>
        </DialogActions>
      </Dialog>
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
