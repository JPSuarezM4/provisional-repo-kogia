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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const roles = ['admin', 'user'];

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://auth-service-production-9571.up.railway.app/api/users', { headers });
      setUsers(res.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setErrorMessage('No se pudieron cargar los usuarios');
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
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" gutterBottom align="center">
        Gestión de Usuarios
      </Typography>

      {/* Crear Usuario */}
      <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
        <Typography variant="subtitle1" gutterBottom align="center">
          Crear nuevo usuario
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Correo"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Rol"
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={handleCreateUser}>
              Crear Usuario
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de usuarios */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom align="center">
          Lista de usuarios
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="center">
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
      </Paper>

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
    </Box>
  );
}
