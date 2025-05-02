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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Sensors as SensorsIcon } from '@mui/icons-material';

export default function AddSensorDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    suscriptor_id: '',
    nombre_nodo: '',
    nodo_id: '',
    dispositivos: [],
  });
  const [newSensor, setNewSensor] = useState({
    sensor_id: "",
    nombre: "",
    tipo: "",
    fabricante: "",
  });
  const [sensorsList, setSensorsList] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { nodos, fetchNodos } = useContext(NodosContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSensorsList([]);
    setNewSensor({
      sensor_id: "",
      nombre: "",
      tipo: "",
      fabricante: "",
    });
  };

  const handleNewSensorChange = (field, value) => {
    setNewSensor((prev) => ({
      ...prev,
      [field]: field === 'sensor_id'
        ? (value === '' ? '' : Number.isInteger(Number(value)) ? parseInt(value, 10) : prev.sensor_id)
        : value,
    }));
  };

  const handleNodoChange = (nodo_id) => {
    const selectedNodo = nodos.find((nodo) => nodo.nodo_id === nodo_id);
    setFormData((prev) => ({
      ...prev,
      nodo_id: parseInt(nodo_id, 10),
      nombre_nodo: selectedNodo ? selectedNodo.nombre_nodo : '',
      dispositivos: selectedNodo ? selectedNodo.dispositivos : [],
    }));
    setSensorsList([]); // Limpiar la lista de sensores al cambiar de nodo
  };

  const handleDispositivoChange = (dispositivo_id) => {
    const selectedNodo = nodos.find((nodo) => nodo.nodo_id === formData.nodo_id);
    const selectedDispositivo = selectedNodo.dispositivos.find((dispositivo) => dispositivo.dispositivo_id === dispositivo_id);
    setFormData((prev) => ({
      ...prev,
      dispositivos: selectedNodo ? selectedNodo.dispositivos : [],
      dispositivo_id: parseInt(dispositivo_id, 10),
      nombre_dispositivo: selectedDispositivo ? selectedDispositivo.nombre : '',
    }));
  };

  const handleAddSensor = () => {
    setSensorsList((prev) => [...prev, newSensor]);
    setNewSensor({
      sensor_id: "",
      nombre: "",
      tipo: "",
      fabricante: "",
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/nodos/${formData.nodo_id}/dispositivos/${formData.dispositivo_id}/sensor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensors: sensorsList }),
      });

      if (!response.ok) throw new Error('Error al guardar los sensores');
      const data = await response.json();
      console.log('Sensores agregados con éxito:', data);
      fetchNodos(); // Actualizar la lista de nodos en el contexto
      handleClose();
      setSnackbar({ open: true, message: 'Sensores agregados con éxito', severity: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Error al agregar los sensores', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Tooltip title="Agregar nuevo sensor">
        <Fab 
          color="primary" 
          aria-label="add" onClick={handleOpen}
          sx={{
            backgroundColor: '#373939', 
            '&:hover': {
              backgroundColor: '#4f5252',
            },
          }}>
          <SensorsIcon sx={{color :'#e9e9e9'}} />
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Agregar nuevo sensor</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Seleccionar nodo"
            value={formData.nodo_id}
            onChange={(e) => handleNodoChange(e.target.value)}
            fullWidth
            margin="normal"
          >
            {nodos.length > 0 ? (
              nodos.map((nodo) => (
                <MenuItem key={nodo.nodo_id} value={nodo.nodo_id}>
                  {nodo.nodo_id}, {nodo.nombre_nodo}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Cargando nodos...</MenuItem>
            )}
          </TextField>
          <TextField
            select
            label="Seleccionar dispositivo"
            value={formData.dispositivo_id || ""}
            onChange={(e) => handleDispositivoChange(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!formData.nodo_id}
          >
            {formData.nodo_id && formData.dispositivos.length > 0 ? (
              formData.dispositivos.map((dispositivo) => (
                <MenuItem key={dispositivo.dispositivo_id} value={dispositivo.dispositivo_id}>
                  {dispositivo.dispositivo_id}, {dispositivo.nombre}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Selecciona un nodo primero</MenuItem>
            )}
          </TextField>
          <TextField
            label="Nombre del sensor"
            value={newSensor.nombre}
            onChange={(e) => handleNewSensorChange('nombre', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nombre del fabricante"
            value={newSensor.fabricante}
            onChange={(e) => handleNewSensorChange('fabricante', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tipo del sensor"
            value={newSensor.tipo}
            onChange={(e) => handleNewSensorChange('tipo', e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button onClick={handleAddSensor} variant="contained" color="primary" sx={{ mt: 2 }}>
            Agregar Sensor
          </Button>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Fabricante</TableCell>
                  <TableCell>Tipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sensorsList.map((sensor, index) => (
                  <TableRow key={index}>
                    <TableCell>{sensor.sensor_id}</TableCell>
                    <TableCell>{sensor.nombre}</TableCell>
                    <TableCell>{sensor.fabricante}</TableCell>
                    <TableCell>{sensor.tipo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
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