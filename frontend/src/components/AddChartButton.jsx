import { useState } from 'react';
import { Button } from '@mui/material';
import AddChartIcon from '@mui/icons-material/AddChart';
import AddChartDialog from './AddChartDialog';

const AddChartButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <Button
                variant="contained" 
                color="primary" 
                onClick={handleOpen} 
                sx={{ 
                    marginBottom: 2,
                    position: 'fixed',
                    top: 10, // Ajusta este valor según sea necesario
                    right: 10, // Ajusta este valor según sea necesario
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
                startIcon={<AddChartIcon />}
            />
            <AddChartDialog 
                open={isOpen} 
                onClose={handleClose} 
                onAddChart={(chartName) => console.log('Gráfico agregado:', chartName)} 
            />
        </>
    );
};

export default AddChartButton;
