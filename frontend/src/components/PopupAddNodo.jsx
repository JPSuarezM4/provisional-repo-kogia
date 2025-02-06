import { useState, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { DeviceHub as DeviceHubIcon } from '@mui/icons-material';
import { NodosContext } from '../context/NodosContext';

export default function AddNodoDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    suscriptor_id: '',
    nombre_nodo: '',
    dispositivos: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const { fetchNodos } = useContext(NodosContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/nodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar el nodo');
      const data = await response.json();
      console.log('Nodo creado con éxito:', data);
      fetchNodos();
      handleClose();
      setSnackbar({ open: true, message: 'Nodo creado con éxito', severity: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Error al guardar el nodo', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: '' });
  };

  return (
    <Box>
      <Tooltip title="Agregar Nuevo Nodo">
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <DeviceHubIcon />
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Agregar Nuevo Nodo</DialogTitle>
        <DialogContent>
          <TextField
            label="ID del Suscriptor"
            value={formData.suscriptor_id}
            onChange={(e) => handleInputChange('suscriptor_id', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nombre del Nodo"
            value={formData.nombre_nodo}
            onChange={(e) => handleInputChange('nombre_nodo', e.target.value)}
            fullWidth
            margin="normal"
          />
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