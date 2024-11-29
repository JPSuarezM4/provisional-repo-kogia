import * as React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Grow,
  Button,
  List

} from '@mui/material';


import {
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

export default function SelectSensors() {
  const [sensors, setSensors] = React.useState('');

  const handleChange = (event) => {
    setSensors(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label" sx={{ color: 'white' }}>
          Seleccionar sensor
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={sensors}
          label="Seleccionar sensor"
          onChange={handleChange}
          sx={{
            mb: 2,
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '.MuiSvgIcon-root': { color: 'white' }, // Change arrow color to white
          }}
        >
          <MenuItem value="ambiente">Ambiente</MenuItem>
          <MenuItem value="calidad">Calidad</MenuItem>
          <MenuItem value="energia">Energía</MenuItem>
        </Select>
      </FormControl>
      {/* Contenedor para superposición */}
      <Box
        sx={{
          position: 'relative',
          height: sensors ? 100 : 0, // Ajusta la altura dinámicamente
          width: 400,
          marginBottom: 2,
          overflow: 'hidden', // Evita mostrar contenido fuera del contenedor
          transition: 'height 0.3s ease', // Transición suave de la altura
        }}
      >
        <Grow in={sensors === 'ambiente'}>
          <Card
            sx={{
              position: 'absolute', // Para que se superponga
              width: '100%',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6">Sensor seleccionado: ambiente</Typography>
              <Typography variant="body2" color="text.secondary">
                Este permite medir parámetros en superficie
              </Typography>
            </CardContent>
          </Card>
        </Grow>
        <Grow in={sensors === 'calidad'}>
          <Card
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6">Sensor seleccionado: calidad</Typography>
              <Typography variant="body2" color="text.secondary">
                Este permite medir la calidad del aire
              </Typography>
            </CardContent>
          </Card>
        </Grow>
        <Grow in={sensors === 'energia'}>
          <Card
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="h6">Sensor seleccionado: energía</Typography>
              <Typography variant="body2" color="text.secondary">
                Este permite medir el consumo de energía
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>
      <List>
        {['Ambiente', 'Calidad', 'Energía'].map((text) => (
          <Card key={text} sx={{ mb: 2 }}>
            <CardContent>
              <Button fullWidth endIcon={<ExpandMoreIcon/>}>
                {text}
              </Button>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
}
