import { useState } from 'react';
import PropTypes from 'prop-types';
import { Fab, Tooltip } from '@mui/material';
import AddChartIcon from '@mui/icons-material/AddChart';
import AddChartDialog from './AddChartDialog';

const AddChartButton = ({ onAddChart }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <Tooltip title="Agregar nuevo gráfico">
                <Fab color="primary" aria-label="add" onClick={handleOpen}>
                    <AddChartIcon />
                </Fab>
            </Tooltip>
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