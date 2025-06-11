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

export default function ContentMeasurement({ open, onClose, nodoId, dispositivoId, sensorId }) {
  const [measurements, setMeasurements] = useState([]);
  const [newUnit, setNewUnit] = useState('');
  const [error, setError] = useState(null);
  const [availableMeasures, setAvailableMeasures] = useState([]); // Cambia de units a measures
  

  const fetchMeasurements = async () => {
    if (!nodoId || !dispositivoId || !sensorId) {
      console.error('Faltan IDs necesarios:', { nodoId, dispositivoId, sensorId });
      return;
    }
  
    try {
      const response = await axios.get(
        `https://sensor-service-production.up.railway.app/api/nodos/${nodoId}/dispositivos/${dispositivoId}/sensor/${sensorId}/medidas`,
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

  const fetchAvailableUnits = async () => {
    try {
      const response = await axios.get('https://measures-service-production.up.railway.app/api/measures/');
      setAvailableMeasures(response.data); // Guarda el array de medidas completo
    } catch (error) {
      console.error('Error al obtener las unidades de medida:', error);
      setError('Error al obtener las unidades de medida');
    }
  };

  const handleAddMeasurement = async () => {
    if (!newUnit) return;

    // Busca el objeto medida seleccionado
    const selectedMeasure = availableMeasures.find(m => m.measure_id === newUnit);

    if (!selectedMeasure) {
      setError('Medida seleccionada no encontrada');
      return;
    }

    // Verifica si ya existe
    if (measurements.some(measurement => measurement.medida_id === selectedMeasure.measure_id)) {
      setError(`La medida ${selectedMeasure.unidad_medida} ya existe.`);
      return;
    }

    try {
      // Actualiza la lista local
      const updatedMeasurements = [...measurements, { 
        medida_id: selectedMeasure.measure_id, 
        unidad: selectedMeasure.unidad_medida, 
        valor: null 
      }];

      // Envía al backend el objeto con medida_id
      await axios.put(
        `https://sensor-service-production.up.railway.app/api/nodos/${nodoId}/dispositivos/${dispositivoId}/sensor/${sensorId}/medidas`,
        { medidas: [{ medida_id: selectedMeasure.measure_id, unidad: selectedMeasure.unidad_medida, valor: null }] }
      );

      setMeasurements(updatedMeasurements);
      setNewUnit('');
      setError(null);
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
      fetchAvailableUnits();
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
              {availableMeasures.map((measure) => (
                <MenuItem key={measure.measure_id} value={measure.measure_id}>
                  {measure.unidad_medida}
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