import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Assessment as MeasuremenetIcon } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'; // Importar TextField para la barra de búsqueda
import AddSensorDialog from './ButtonAddSensor';
import { NodosContext } from '../context/NodosContext';
import ContentMeasurement from './ContentMeasurment.jsx';

export default function DevicesTable() {
  const { nodos, fetchNodos } = useContext(NodosContext);
  const [sensors, setSensors] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [openMeasurementDialog, setOpenMeasurementDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  useEffect(() => {
    // Llama a fetchNodos al iniciar la página para asegurar que los datos estén disponibles
    const loadData = async () => {
      setLoading(true); // Comienza el estado de carga
      await fetchNodos(); // Asegúrate de que fetchNodos esté completamente ejecutado
      fetchDevices(); // Llama a fetchDevices una vez que los nodos estén cargados
      setLoading(false); // Termina el estado de carga
    };

    loadData();
  }, []);

  useEffect(() => {
    // Actualiza los dispositivos si cambian los nodos
    fetchDevices();
  }, [nodos]);

  const fetchDevices = () => {
    if (!nodos || nodos.length === 0) return;
    
    const sensores = nodos.flatMap((nodo) => {
      console.log('Nodo:', nodo); // Para ver la estructura del nodo
      return (nodo.dispositivos || []).flatMap((dispositivo) => {
        console.log('Dispositivo:', dispositivo); // Para ver la estructura del dispositivo
        return (dispositivo.sensor || []).map((sensor) => {
          console.log('Sensor:', sensor); // Para ver la estructura del sensor
          return {
            ...sensor,
            dispositivoNombre: dispositivo.nombre,
            nodoNombre: nodo.nombre_nodo,
            nodo_id: nodo.nodo_id || nodo.id, // Ajusta esto según tu estructura de datos
            dispositivo_id: dispositivo.dispositivo_id || dispositivo.id // Ajusta esto según tu estructura de datos
          };
        });
      });
    });
    
    console.log('Sensores procesados:', sensores); // Para ver el resultado final
    setSensors(sensores);
  };

  const updateSensors = () => {
    fetchNodos(); // Actualiza el contexto de nodos
    fetchDevices(); // Actualiza la tabla de sensores
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (sensor) => {
    setSelectedSensor(sensor);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSensor(null);
  };

  const handleEdit = (sensor) => {
    console.log('Editar sensor:', sensor);
  };

  const handleOpenMeasurementDialog = (sensor) => {
    console.log('Sensor seleccionado:', sensor); // Para verificar qué datos tenemos
    setSelectedSensor(sensor);
    setOpenMeasurementDialog(true);
  };

  const handleCloseMeasurementDialog = () => setOpenMeasurementDialog(false);

  const handleDelete = (sensor) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el sensor ${sensor.nombre}?`)) {
      axios
        .delete(`http://127.0.0.1:5000/api/sensores/${sensor.sensor_id}`)
        .then(() => {
          setSensors((prevSensors) =>
            prevSensors.filter((s) => s.sensor_id !== sensor.sensor_id)
          );
          fetchNodos(); // Actualizar la lista de nodos en el contexto
        })
        .catch((error) => {
          console.error('Error al eliminar el sensor:', error);
        });
    }
  };

  const columns =
    sensors.length > 0
      ? Object.keys(sensors[0])
          .filter((key) => key !== 'tipo' && key !== 'medidas') // Filtrar la columna "medidas"
          .filter((key) => key !== 'tipo' && key !== 'ultimo_id')
          .map((key) => ({
            id: key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            minWidth: 100,
            align: 'center',
          }))
      : [];

  // Filtrar los sensores basados en el término de búsqueda
  const filteredSensors = sensors.filter(sensor =>
    sensor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}
      >
        <Typography variant="h6" component="div">
          Sensores
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Buscar Sensor"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginRight: 2 }}
          />
          <AddSensorDialog onAdd={() => updateSensors()} />
        </Box>
      </Box>
      {loading ? (
        <Typography sx={{ textAlign: 'center', padding: 2 }}>Cargando datos...</Typography>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell key="acciones" align="center" style={{ minWidth: 100 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSensors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((sensor) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={`${sensor.nodo_id}-${sensor.sensor_id}`}>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          {typeof sensor[column.id] === 'object' ? JSON.stringify(sensor[column.id]) : sensor[column.id]}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <Tooltip title="Ver Detalles">
                          <IconButton onClick={() => handleOpenDialog(sensor)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleEdit(sensor)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton onClick={() => handleDelete(sensor)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver Medidas del Sensor">
                          <IconButton onClick={() => handleOpenMeasurementDialog(sensor)}>
                            <MeasuremenetIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredSensors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Detalles del Sensor</DialogTitle>
        <DialogContent>
          {selectedSensor ? (
            <div>
              <p>
                <strong>ID:</strong> {selectedSensor.sensor_id}
              </p>
              <p>
                <strong>Nombre:</strong> {selectedSensor.nombre}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedSensor.tipo}
              </p>
              <p>
                <strong>Dispositivo:</strong> {selectedSensor.dispositivoNombre}
              </p>
              <p>
                <strong>Nodo:</strong> {selectedSensor.nodoNombre}
              </p>
            </div>
          ) : (
            <p>Cargando...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
        <Dialog open={openMeasurementDialog} onClose={handleCloseMeasurementDialog}>
          <DialogContent>
            <ContentMeasurement 
              sensorId={selectedSensor?.sensor_id}
              dispositivoId={selectedSensor?.dispositivo_id}
              nodoId={selectedSensor?.nodo_id}
              open={openMeasurementDialog}
              onClose={handleCloseMeasurementDialog}
              sensor={selectedSensor} 
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMeasurementDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
    </Paper>
  );
}