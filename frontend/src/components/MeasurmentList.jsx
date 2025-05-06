import { useState, useEffect } from 'react';
import {
    TextField,
    Select,
    MenuItem,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const MeasurementList = () => {
    const [measurements, setMeasurements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentMeasurement, setCurrentMeasurement] = useState(null);
    const [newMeasurement, setNewMeasurement] = useState({
        nombre_medida: '',
        unidad_medida: '',
        descripcion: '',
        min: '',
        max: '',
        estado: 'activo',
       
    });

    useEffect(() => {
        // Fetch measurements from API or database
        fetch('https://measures-service-production.up.railway.app/api/measures/')
            .then(response => response.json())
            .then(data => {
                setMeasurements(data);
            });
    }, []);
    

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleOpen = () => {
        setEditMode(false);
        setNewMeasurement({
            nombre_medida: '',
            unidad_medida: '',
            descripcion: '',
            min: '',
            max: '',
            estado: 'activo',
           
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setNewMeasurement(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAddMeasurement = () => {
        console.log('Nueva medida:', newMeasurement); 

        fetch('https://measures-service-production.up.railway.app/api/measures/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMeasurement),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Medida agregada:', data);  // Verifica la respuesta
                setMeasurements(prevState => [...prevState, data]);
                handleClose();
            });
    };

    const handleEditMeasurement = () => {
        fetch(`https://measures-service-production.up.railway.app/${currentMeasurement.measure_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMeasurement),
        })
            .then(response => response.json())
            .then(data => {
                setMeasurements(prevState =>
                    prevState.map(measurement =>
                        measurement.measure_id === data.measure_id ? data : measurement
                    )
                );
                handleClose();
            });
    };

    const handleDeleteMeasurement = (measure_id) => {
        fetch(`https://measures-service-production.up.railway.app/api/measures/${measure_id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(() => {
                setMeasurements(prevState =>
                    prevState.filter(measurement => measurement.measure_id !== measure_id)
                );
            });
    };

    const handleEditClick = (measurement) => {
        setEditMode(true);
        setCurrentMeasurement(measurement);
        setNewMeasurement({
            nombre_medida: measurement.nombre_medida,
            unidad_medida: measurement.unidad_medida,
            descripcion: measurement.descripcion,
            min: measurement.min,
            max: measurement.max,
            estado: measurement.estado,
        });
        setOpen(true);
    };

    const filteredMeasurements = measurements.filter(measurement => {
        return (
            (filter === 'all' || measurement.estado === filter) &&
            (measurement.nombre_medida.toLowerCase().includes(searchTerm.toLowerCase()) ||
                measurement.unidad_medida.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <Box sx={{ p: 3, color: 'white' }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
                Lista de medidas
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    label="Busqueda por nombre o unidad"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearch}
                    fullWidth
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{
                        style: { color: 'white' },
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                        },
                    }}
                />
                <FormControl variant="outlined" fullWidth>
                    <InputLabel sx={{ color: 'white' }}>Filtro</InputLabel>
                    <Select
                        value={filter}
                        onChange={handleFilterChange}
                        label="Filter"
                        sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'white',
                            },
                        }}
                    >
                        <MenuItem value="all">Todo</MenuItem>
                        <MenuItem value="activo">Activo</MenuItem>
                        <MenuItem value="inactivo">Inactivo</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleOpen}>
                    Agregar Medida
                </Button>
            </Box>
            <Table sx={{ borderColor: 'white' }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Nombre</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Unidad</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Descripcion</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Estado</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Mínimo</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Máximo</TableCell>
                        <TableCell sx={{ color: 'white', borderColor: 'white' }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredMeasurements.map(measurement => (
                        <TableRow key={measurement.measure_id}>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>{measurement.nombre_medida}</TableCell>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>{measurement.unidad_medida}</TableCell>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>{measurement.descripcion}</TableCell>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>{measurement.estado}</TableCell>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>{measurement.min}</TableCell>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>{measurement.max}</TableCell>
                            <TableCell sx={{ color: 'white', borderColor: 'white' }}>
                                <IconButton onClick={() => handleEditClick(measurement)} color="primary">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteMeasurement(measurement.measure_id)} color="secondary">
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editMode ? 'Editar Medida' : 'Agregar Nueva Medida'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nombre_medida"
                        label="Nombre"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newMeasurement.nombre_medida}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="unidad_medida"
                        label="Unidad"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newMeasurement.unidad_medida}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="descripcion"
                        label="Descripcion"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newMeasurement.descripcion}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="min"
                        label="Mínimo"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={newMeasurement.min}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="max"
                        label="Máximo"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={newMeasurement.max}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth variant="outlined" margin="dense">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            name="estado"
                            value={newMeasurement.estado}
                            onChange={handleChange}
                            label="Estado"
                        >
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={editMode ? handleEditMeasurement : handleAddMeasurement} color="primary">
                        {editMode ? 'Guardar Cambios' : 'Agregar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MeasurementList;