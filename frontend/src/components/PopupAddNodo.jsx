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
    descripcion_nodo: '',
    latitud: '',
    longitud: '',
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
      <Tooltip title="Agregar nuevo dispositivo">
          <Fab 
            color="primary" 
            aria-label="add" onClick={handleOpen} 
            sx={{ backgroundColor: '#e9e9e9', // Color del botón
            color: '#373939', // Color del texto
            '&:hover': {
                backgroundColor: '#d6d6d6', // Color del botón al pasar el mouse
            } }}>
            <DeviceHubIcon sx={{color: '#373939'}}/>
          </Fab>
        </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Agregar nuevo nodo</DialogTitle>
        <DialogContent>
          <TextField
            label="ID del suscriptor"
            value={formData.suscriptor_id}
            onChange={(e) => handleInputChange('suscriptor_id', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nombre del nodo"
            value={formData.nombre_nodo}
            onChange={(e) => handleInputChange('nombre_nodo', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Descripción del nodo"
            value={formData.descripcion_nodo}
            onChange={(e) => handleInputChange('descripcion_nodo', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Latitud"
            value={formData.latitud}
            onChange={(e) => handleInputChange('latitud', e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ pattern: '[A-Za-z0-9]*' }}
          />
          <TextField
            label="Longitud"
            value={formData.longitud}
            onChange={(e) => handleInputChange('longitud', e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ pattern: '[A-Za-z0-9]*' }}
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