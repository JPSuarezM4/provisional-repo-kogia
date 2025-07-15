import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const roles = ['admin', 'user'];

export default function UserManagement() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('token');

  
  console.log("TOKEN JWT:", token); 

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Obtener usuarios al cargar o cuando se cambie algo
  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://auth-service-production-9571.up.railway.app/api/users', { headers });
      console.log("Usuarios obtenidos:", res.data); // <-- AGREGA ESTO
      setUsers(res.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const res = await axios.post(
        'https://auth-service-production-9571.up.railway.app/api/create-user',
        { email, password, role },
        { headers }
      );
      setSuccessMessage(res.data.message);
      setEmail('');
      setPassword('');
      setRole('user');
      fetchUsers();
    } catch {
      setErrorMessage('Error al crear usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`https://auth-service-production-9571.up.railway.app/api/users/${userId}`, { headers });
      fetchUsers();
    } catch {
      setErrorMessage('Error al eliminar usuario');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Gestión de usuarios
      </Typography>

      {/* Pestañas */}
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Crear Usuario" />
        <Tab label="Lista de Usuarios" />
      </Tabs>

      {/* Crear Usuario */}
      {tab === 0 && (
        <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
          <TextField
            label="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            select
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={handleCreateUser}>
            Crear Usuario
          </Button>
        </Box>
      )}

      {/* Lista de Usuarios */}
      {tab === 1 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {/* Aquí puedes agregar funcionalidad de edición más adelante */}
                  <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                    <Delete />
                  </IconButton>
                  <IconButton color="primary" disabled>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Alertas */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
