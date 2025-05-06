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
  //List,
  //ListItem,
 // ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
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

  const handleAddDevice = () => {
    setFormData((prev) => ({
      ...prev,
      dispositivos: [...prev.dispositivos, newDevice],
    }));
    setNewDevice({ dispositivo_id: "", nombre: '', tipo: '' });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`https://sensor-service-production.up.railway.app/api/nodos/${formData.nodo_id}/dispositivos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispositivos: formData.dispositivos }),
      });

      if (!response.ok) throw new Error('Error al guardar el nodo');
      const data = await response.json();
      console.log('Nodo actualizado con éxito:', data);
      fetchNodos(); // Actualizar la lista de nodos en el contexto
      handleClose();
      setSnackbar({ open: true, message: 'Dispositivos agregados con éxito', severity: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Error al agregar los dispositivos', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
          <DevicesIcon sx={{color: '#373939'}}/>
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Agregar nuevo dispositivo</DialogTitle>
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
                  {nodo.nodo_id}, {nodo.nombre_nodo}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Cargando nodos...</MenuItem>
            )}
          </TextField>
        {/*   <TextField
            label="ID del dispositivo"
            value={newDevice.dispositivo_id}
            onChange={(e) => handleNewDeviceChange('dispositivo_id', e.target.value)}
            fullWidth
            margin="normal"
          /> */}
          <TextField
            label="Nombre del dispositivo"
            value={newDevice.nombre}
            onChange={(e) => handleNewDeviceChange('nombre', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tipo del dispositivo"
            value={newDevice.tipo}
            onChange={(e) => handleNewDeviceChange('tipo', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID del dispositivo</TableCell>
                  <TableCell>Nombre del dispositivo</TableCell>
                  <TableCell>Tipo del dispositivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.dispositivos.map((device, index) => (
                  <TableRow key={index}>
                    <TableCell>{device.dispositivo_id}</TableCell>
                    <TableCell>{device.nombre}</TableCell>
                    <TableCell>{device.tipo}</TableCell>
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
          <Button onClick={handleAddDevice} variant="contained" color="primary">
            Guardar y Crear Nuevo
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Finalizar
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