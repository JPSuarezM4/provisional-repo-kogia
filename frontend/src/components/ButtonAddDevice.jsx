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
import { Devices as DevicesIcon } from '@mui/icons-material';

export default function AddDeviceDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    suscriptor_id: '',
    nombre_nodo: '',
    nodo_id: '',
    dispositivos: [],
  });
  const [newDevice, setNewDevice] = useState({
    dispositivo_id: "",
    nombre: '',
    tipo: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { nodos, fetchNodos } = useContext(NodosContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleNewDeviceChange = (field, value) => {
    setNewDevice((prev) => ({
      ...prev,
      [field]: field === 'dispositivo_id'
        ? (value === '' ? '' : Number.isInteger(Number(value)) ? parseInt(value, 10) : prev.dispositivo_id)
        : value,
    }));
  };

  const handleNodoChange = (nodo_id) => {
    const selectedNodo = nodos.find((nodo) => nodo.nodo_id === nodo_id);
    setFormData((prev) => ({
      ...prev,
      nodo_id,
      nombre_nodo: selectedNodo ? selectedNodo.nombre_nodo : '',
      dispositivos: selectedNodo ? selectedNodo.dispositivos : [],
    }));
  };

  const handleSubmit = async () => {
    try {
      const updatedDispositivos = [...formData.dispositivos, newDevice];

      const response = await fetch(`http://127.0.0.1:5000/api/nodos/${formData.nodo_id}/dispositivos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispositivos: updatedDispositivos }),
      });

      if (!response.ok) throw new Error('Error al guardar el nodo');
      const data = await response.json();
      console.log('Nodo actualizado con éxito:', data);
      fetchNodos(); // Actualizar la lista de nodos en el contexto
      handleClose();
      setSnackbar({ open: true, message: 'Dispositivo agregado con éxito', severity: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Error al agregar el dispositivo', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Tooltip title="Agregar Nuevo Dispositivo">
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <DevicesIcon />
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Agregar Nuevo Dispositivo</DialogTitle>
        <DialogContent>
          <TextField
            label="ID del dispositivo"
            value={newDevice.dispositivo_id}
            onChange={(e) => handleNewDeviceChange('dispositivo_id', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nombre del Dispositivo"
            value={newDevice.nombre}
            onChange={(e) => handleNewDeviceChange('nombre', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tipo del Dispositivo"
            value={newDevice.tipo}
            onChange={(e) => handleNewDeviceChange('tipo', e.target.value)}
            fullWidth
            margin="normal"
          />
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
                  {nodo.nodo_id}, {nodo.nombre_nodo}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Cargando nodos...</MenuItem>
            )}
          </TextField>
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