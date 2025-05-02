import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import AddChartIcon from '@mui/icons-material/AddChart';
import AddChartDialog from './AddChartDialog';

const AddChartButton = ({ onAddChart }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <Button
                variant="contained"
                onClick={handleOpen}
                startIcon={
                    <AddChartIcon 
                        style={{ fontSize: '30px', color: '#373939' }} // Color del ícono
                    />
                }
                sx={{
                    borderRadius: '24px', // Hace el botón circular
                    padding: '16px 32px', // Ajusta el tamaño del botón
                    fontSize: '1.20rem', // Tamaño de la fuente
                    textTransform: 'none', // Evita que el texto esté en mayúsculas
                    backgroundColor: '#e9e9e9', // Color del botón
                    color: '#373939', // Color del texto
                    '&:hover': {
                        backgroundColor: '#d6d6d6', // Color del botón al pasar el mouse
                    },
                }}
            >
                Agregar gráfico
            </Button>

            <AddChartDialog 
                open={isOpen} 
                onClose={handleClose} 
                onAddChart={onAddChart} 
            />
        </>
    );
};

AddChartButton.propTypes = {
    onAddChart: PropTypes.func.isRequired,
};

export default AddChartButton;