import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ExportButton = ({ disabled, onExport }) => (
  <Button
    variant="contained"
    startIcon={<DownloadIcon />}
    onClick={onExport}
    disabled={disabled}
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
    Exportar datos
  </Button>
);

ExportButton.propTypes = {
  disabled: PropTypes.bool,
  onExport: PropTypes.func.isRequired,
};

export default ExportButton;