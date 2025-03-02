import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { NodosContext } from '../context/NodosContext';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';


export default function AddMeasureDialog({ open, onClose, onAddMeasure }) {
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

  const handleAdd = () => {
    onAddMeasure(formData);
    setSnackbar({ open: true, message: 'Medida agregada con exito', severity: 'success' });
    onClose();
  };


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar nueva medida</DialogTitle>
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
          value={formData.dispositivo_id}
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
          value={formData.sensor_id}
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
          label="Seleccionar Medida"
          value={formData.medida_id}
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
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleAdd} color="primary">
          Agregar
        </Button>
      </DialogActions>
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
    </Dialog>
  );
};

AddMeasureDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddMeasure: PropTypes.func.isRequired,
};
