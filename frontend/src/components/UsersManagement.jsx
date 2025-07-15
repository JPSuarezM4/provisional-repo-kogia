import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import axios from 'axios';

const roles = ['admin', 'user'];

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('token');

  const handleCreateUser = async () => {
    try {
      const response = await axios.post(
        'https://auth-service-production-9571.up.railway.app/create-user',
        { email, password, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMessage(response.data.message);
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || 'Error al crear el usuario.'
      );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Crear nuevo usuario
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <TextField
          label="Rol"
          select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
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

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
