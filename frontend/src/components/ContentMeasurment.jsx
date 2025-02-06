import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';

const availableUnits = ['°C', '%RH', 'pH', 'mS/cm'];

export default function ContentMeasurement({ open, onClose, nodoId, dispositivoId, sensorId }) {
  const [measurements, setMeasurements] = useState([]);
  const [newUnit, setNewUnit] = useState('');
  const [error, setError] = useState(null);

  const fetchMeasurements = async () => {
    if (!nodoId || !dispositivoId || !sensorId) {
      console.error('Faltan IDs necesarios:', { nodoId, dispositivoId, sensorId });
      return;
    }
  
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/nodos/${nodoId}/dispositivos/${dispositivoId}/sensor/${sensorId}/medidas`,
      );
  
      console.log('Respuesta de medidas:', response.data);
  
      const medidas = response.data.medidas || [];
  
      console.log('Medidas extraídas:', medidas);
      console.log('Estructura exacta:', JSON.stringify(response.data, null, 2));
  
      if (!Array.isArray(medidas)) {
        console.error('Formato de medidas inválido:', medidas);
        setError('Formato de medidas inválido');
        setMeasurements([]);
        return;
      }

      setMeasurements(medidas);
    } catch (error) {
      console.error('Error al obtener las medidas:', error);
      setError('Error al obtener las medidas');
      setMeasurements([]);
    }
  };
  
  const handleAddMeasurement = async () => {
    if (!newUnit) return;
  
    try {
      // Obtener la lista actual antes de agregar la nueva medida
      const updatedMeasurements = [...measurements, { unidad: newUnit }];
  
      // Enviar la lista actualizada al backend
      await axios.put(
        `http://127.0.0.1:5000/api/nodos/${nodoId}/dispositivos/${dispositivoId}/sensor/${sensorId}/medidas`,
        { medidas: updatedMeasurements }
      );
  
      // **Actualizar el estado sin volver a hacer una petición extra**
      setMeasurements(updatedMeasurements);
      setNewUnit('');
    } catch (error) {
      console.error('Error al agregar la medida:', error);
      setError(error.response?.data || error.message);
    }
  };
  
  

  const handleSave = async () => {
    // Add your save logic here
  };

  useEffect(() => {
    if (open) {
      fetchMeasurements();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Medidas del Sensor</DialogTitle>
      <DialogContent>
        {error && (
          <Typography>
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </Typography>

        )}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Unidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No hay medidas disponibles
                  </TableCell>
                </TableRow>
              ) : (
                measurements.map((measurement, index) => (
                  <TableRow key={index}>
                    <TableCell>{measurement.unidad}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <FormControl fullWidth sx={{ ml: 2 }}>
            <InputLabel>Unidad</InputLabel>
            <Select
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            >
              {availableUnits.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            onClick={handleAddMeasurement} 
            variant="contained" 
            color="primary" 
            sx={{ ml: 2 }}
            disabled={!newUnit}
          >
            Agregar
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          Guardar
        </Button>
        <Button onClick={onClose} color="secondary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ContentMeasurement.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nodoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dispositivoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sensorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
