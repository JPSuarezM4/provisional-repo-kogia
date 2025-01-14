import * as React from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function DevicesTable() {
  const [devices, setDevices] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState(null);

  // Fetch devices data on mount
  React.useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = () => {
    axios
      .get("http://127.0.0.1:5000/api/nodos")
      .then((response) => {
        const dispositivos = response.data.map((nodo) => {
          return {
            nodo_id: nodo.nodo_id, // Asegúrate de que esto exista en la respuesta
            nombre_nodo: nodo.nombre_nodo, // Asegúrate de que esto exista en la respuesta
            dispositivos: nodo.dispositivos.map((dispositivo) => {
              return dispositivo.sensores.map((sensor) => ({
                nombre: sensor.nombre,
                tipo: sensor.tipo,
                medidas: sensor.medidas,
              }));
            }).flat(), // Asegúrate de aplanar correctamente los sensores
          };
        });
  
        console.log("Dispositivos procesados:", dispositivos); // Verifica la estructura procesada
        setDevices(dispositivos); // Guarda los datos en el estado
      })
      .catch((error) => {
        console.error("Error al obtener los dispositivos:", error);
      });
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (device) => {
    setSelectedDevice(device);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDevice(null);
  };



  const handleDelete = (device) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el dispositivo ${device.nombre_nodo}?`)) {
      axios.delete(`http://127.0.0.1:5000/api/nodos/${device.nodo_id}`)
        .then(() => {
          fetchDevices(); // Vuelve a cargar los dispositivos después de eliminar
        })
        .catch((error) => {
          console.error("Error al eliminar el dispositivo:", error);
        });
    }
  };
  
  const handleEdit = (device) => {
    // Supongamos que editas el dispositivo aquí
    // Después de la operación, vuelve a cargar los dispositivos
    axios.put(`http://127.0.0.1:5000/api/nodos/${device.nodo_id}`)
      .then(() => {
        fetchDevices(); // Refresca los datos
      })
      .catch((error) => {
        console.error("Error al editar el dispositivo:", error);
      });
  };


  const columns = devices.length > 0 ? Object.keys(devices[0]).map((key) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitaliza la primera letra del título
    minWidth: 100,
    align: 'center',
  })) : [];

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
              <TableCell key="acciones" align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((device) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={device.nodo_id}> {/* Usando nodo_id */}
                  <TableCell align="center">{device.nodo_id}</TableCell> {/* Usando nodo_id */}
                  <TableCell align="center">{device.nombre_nodo}</TableCell>
                  <TableCell align="center">{device.dispositivos.length}</TableCell> {/* Mostrar número de sensores */}
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(device)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(device)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(device)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={devices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Dialog for device details */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Detalles del Dispositivo</DialogTitle>
        <DialogContent>
          {selectedDevice ? (
            <div>
              <p><strong>ID:</strong> {selectedDevice.nodo_id}</p> {/* Usando nodo_id */}
              <p><strong>Nombre del Dispositivo:</strong> {selectedDevice.nombre_nodo}</p>
              <p><strong>Lista de Sensores:</strong></p>
              <ul>
                {selectedDevice.dispositivos.map((sensor, index) => (
                  <li key={index}>
                    <strong>Nombre:</strong> {sensor.nombre} <br />
                    <strong>Tipo:</strong> {sensor.tipo} <br />
                    <strong>Medidas:</strong> {sensor.medidas.map((medida, index) => (
                      <ul key={index}>
                        <p><strong>Valor:</strong> {medida.valor} {medida.unidad}</p>
                        <p><strong>Unidad:</strong> {medida.unidad}</p>
                        <p><strong>Medida ID:</strong> {medida.medida_id}</p>
                      </ul>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Cargando...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
