import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Accordion,
  AccordionSummary, AccordionDetails, Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

export default function PopupEditAll({
  open,
  onClose,
  nodo,
  dispositivo,
  sensor,
  availableMeasures = [],
  onSave,
}) {
  const [nodoForm, setNodoForm] = useState({ nombre: "", descripcion: "" });
  const [dispositivoForm, setDispositivoForm] = useState({ nombre: "", tipo: "" });
  const [sensorForm, setSensorForm] = useState({ nombre: "", tipo: "", fabricante: "", medidas: [] });

useEffect(() => {
  if (nodo) {
    setNodoForm({
      nombre: nodo.nombre || nodo.nombre_nodo || "",
      descripcion: nodo.descripcion || "",
    });
  }
  if (dispositivo) {
    setDispositivoForm({
      nombre: dispositivo.nombre || "",
      tipo: dispositivo.tipo || "",
    });
  }
  if (sensor) {
    setSensorForm({
      nombre: sensor.nombre || "",
      tipo: sensor.tipo || "",
      fabricante: sensor.fabricante || "",
      medidas: sensor.medidas ? sensor.medidas.map(m => m.medida_id) : [],
    });
  }
}, [nodo, dispositivo, sensor, open]);


  const handleNodoChange = (e) => setNodoForm({ ...nodoForm, [e.target.name]: e.target.value });
  const handleDispositivoChange = (e) => setDispositivoForm({ ...dispositivoForm, [e.target.name]: e.target.value });
  const handleSensorChange = (e) => setSensorForm({ ...sensorForm, [e.target.name]: e.target.value });
  const handleSensorMeasuresChange = (e) => setSensorForm({
    ...sensorForm,
    medidas: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value,
  });

  const handleSave = () => {
    const medidasCompletas = availableMeasures
      .filter((m) => sensorForm.medidas.includes(m.medida_id))
      .map((m) => ({
        medida_id: m.medida_id,
        unidad: m.unidad,
        valor: null,
      }));

    if (onSave) {
      onSave({
        nodo: { ...nodo, ...nodoForm },
        dispositivo: { ...dispositivo, ...dispositivoForm },
        sensor: { ...sensor, ...sensorForm, medidas: medidasCompletas },
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar Información</DialogTitle>
      <DialogContent dividers>
        {/* Nodo */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Nodo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Nombre Nodo"
                name="nombre"
                value={nodoForm.nombre}
                onChange={handleNodoChange}
                fullWidth
              />
              <TextField
                label="Descripción"
                name="descripcion"
                value={nodoForm.descripcion}
                onChange={handleNodoChange}
                fullWidth
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Dispositivo */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dispositivo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Nombre Dispositivo"
                name="nombre"
                value={dispositivoForm.nombre}
                onChange={handleDispositivoChange}
                fullWidth
              />
              <TextField
                label="Tipo"
                name="tipo"
                value={dispositivoForm.tipo}
                onChange={handleDispositivoChange}
                fullWidth
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Sensor */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Sensor</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nombre Sensor"
                name="nombre"
                value={sensorForm.nombre}
                onChange={handleSensorChange}
                fullWidth
              />
              <TextField
                label="Tipo"
                name="tipo"
                value={sensorForm.tipo}
                onChange={handleSensorChange}
                fullWidth
              />
              <TextField
                label="Fabricante"
                name="fabricante"
                value={sensorForm.fabricante}
                onChange={handleSensorChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="medidas-label">Medidas</InputLabel>
                <Select
                  labelId="medidas-label"
                  multiple
                  name="medidas"
                  value={sensorForm.medidas}
                  onChange={handleSensorMeasuresChange}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (id) =>
                          availableMeasures.find((m) => m.medida_id === id)?.unidad || id
                      )
                      .join(", ")
                  }
                >
                  {availableMeasures.map((measure) => (
                    <MenuItem key={measure.medida_id} value={measure.medida_id}>
                      <Checkbox checked={sensorForm.medidas.includes(measure.medida_id)} />
                      <ListItemText primary={measure.unidad} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

PopupEditAll.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nodo: PropTypes.object,
  dispositivo: PropTypes.object,
  sensor: PropTypes.object,
  availableMeasures: PropTypes.array,
  onSave: PropTypes.func,
};
