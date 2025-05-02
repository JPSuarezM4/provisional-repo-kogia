import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate(); // Hook para redirigir

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://auth-service-production-9571.up.railway.app//api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token); // Guarda el token en localStorage
                setMessage('Inicio de sesión exitoso');
                setError(false);
                navigate('/'); // Redirige a la aplicación principal
            } else {
                setMessage(data.message || 'Error al iniciar sesión');
                setError(true);
            }
        } catch {
            setMessage('Error al conectar con el servidor');
            setError(true);
        }
    };

    // Color personalizable para el botón y el enfoque
    const buttonColor = '#373939'; // Cambia este valor para personalizar el color

    // Tema personalizado para Material-UI
    const theme = createTheme({
        palette: {
            primary: {
                main: buttonColor, // Aplica el color personalizado al enfoque
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center', // Centra horizontalmente
                    alignItems: 'center', // Centra verticalmente
                    minHeight: '100vh',
                    width: '100vw',
                    backgroundImage: 'url(/kogiatempback.jpg)', // Imagen de fondo
                    backgroundSize: 'cover', // Asegura que la imagen cubra toda la pantalla
                    backgroundPosition: 'center', // Centra la imagen
                }}
            >
                {/* Cuadro de login */}
                <Box
                    sx={{
                        maxWidth: 400,
                        width: '100%',
                        backgroundColor: '#fff', // Fondo blanco solo para el cuadro flotante
                        padding: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        boxShadow: 3,
                        borderRadius: 2,
                    }}
                >
                    {/* Texto "KOGIA" con la fuente Seaweed Script */}
                    <Typography
                        variant="h1"
                        align="center"
                        gutterBottom
                        sx={{
                            fontFamily: "'Seaweed Script'", // Aplica la fuente
                            color: '#373939', // Color del texto
                        }}
                    >
                        Kogia
                    </Typography>
                    <Typography variant="h10" align="center" gutterBottom sx={{ color: '#373939' }}>
                        Iniciar Sesión
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                marginTop: 2,
                                backgroundColor: buttonColor, // Color personalizable
                                '&:hover': {
                                    backgroundColor: `${buttonColor}CC`, // Color más claro al pasar el mouse
                                },
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                    </form>
                    {message && (
                        <Alert severity={error ? 'error' : 'success'} sx={{ marginTop: 2 }}>
                            {message}
                        </Alert>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Login;