import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Typography,
  Box,
  Fab,
} from '@mui/material';

import {
  
  Add as AddIcon

} from '@mui/icons-material';

// Datos iniciales para el select múltiple
const availableMeasures = ['Temperatura', 'Humedad', 'pH', 'Conductividad'];

export default function AddSensorDialog() {
  const [open, setOpen] = useState(false);
  const [selectedMeasures, setSelectedMeasures] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleMeasureChange = (event) => {
    const { value } = event.target;
    setSelectedMeasures(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <AddIcon />
        </Fab>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Agregar Nuevo Sensor</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <TextField label="Tipo de Sensor" placeholder="Ejemplo: Sensor de Humedad" />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField label="Nombre del Fabricante" placeholder="Ejemplo: SensorTech Co." />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Parámetros que mide</InputLabel>
            <Select
              multiple
              value={selectedMeasures}
              onChange={handleMeasureChange}
              renderValue={(selected) => selected.join(', ')}
            >
              {availableMeasures.map((measure) => (
                <MenuItem key={measure} value={measure}>
                  <Checkbox checked={selectedMeasures.includes(measure)} />
                  <ListItemText primary={measure} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle1" gutterBottom>
            Ubicación Geográfica
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Latitud" placeholder="Ejemplo: 6.2442" />
            <TextField label="Longitud" placeholder="Ejemplo: -75.5812" />
          </Box>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Atributos
          </Typography>
          <FormControl fullWidth margin="normal">
            <TextField label="¿Qué mide?" placeholder="Ejemplo: Humedad del suelo" />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField label="¿Para qué?" placeholder="Ejemplo: Optimizar riego" />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField label="Código del Sensor" placeholder="Ejemplo: SENS123" />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
