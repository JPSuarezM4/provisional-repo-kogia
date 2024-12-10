import * as React from 'react';
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

const columns = [
  { id: 'ID', label: 'ID', minWidth: 100 },
  { id: 'Tipo', label: 'Tipo', minWidth: 100, align: 'center' },
  { id: 'Fecha', label: 'Fecha Creación', minWidth: 100, align: 'center' },
  { id: 'Ubicación', label: 'Ubicación', minWidth: 100, align: 'right' },
  { id: 'Acciones', label: 'Acciones', minWidth: 150, align: 'center' },
];

function createData(ID, Tipo, Fecha, Ubicación) {
  return { ID, Tipo, Fecha, Ubicación };
}

const rows = [
  createData(1, 'Calidad Agua', '01/12/2024', 'Medellín'),
  createData(2, 'Agua', '01/12/2024', 'Medellín'),
  createData(3, 'Agua', '01/12/2024', 'Medellín'),
];

export default function SensorsTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedSensor, setSelectedSensor] = React.useState(null);

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

  const handleDelete = (sensor) => {
    console.log('Eliminar sensor:', sensor);
  };

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
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.ID}>
                  {columns.map((column) => {
                    if (column.id === 'Acciones') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <IconButton onClick={() => handleEdit(row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleOpenDialog(row)}>
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(row)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      );
                    }
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Dialog for sensor details */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Detalles del Sensor</DialogTitle>
        <DialogContent>
          {selectedSensor ? (
            <div>
              <p><strong>ID:</strong> {selectedSensor.ID}</p>
              <p><strong>Tipo:</strong> {selectedSensor.Tipo}</p>
              <p><strong>Fecha:</strong> {selectedSensor.Fecha}</p>
              <p><strong>Ubicación:</strong> {selectedSensor.Ubicación}</p>
              {/* Aquí puedes agregar más detalles o incluso otra tabla */}
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
