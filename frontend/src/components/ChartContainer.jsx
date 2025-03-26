import SensorChart from './AddChart';
import PropTypes from 'prop-types';

const ChartContainer = ({ charts }) => {
    return (
        <div 
            className="flex flex-wrap justify-center gap-4 w-full" 
            style={{ maxWidth: '1200px', margin: '0 auto' }} // Limitar el ancho del contenedor
        >
            {charts.map((chartConfig, index) => (
                <div 
                    key={index} 
                    style={{ width: '100%', padding: '16px' }} // Ajustar el ancho de cada gráfico
                >
                    <SensorChart 
                        nodo_id={String(chartConfig.nodo_id)} 
                        dispositivo_id={String(chartConfig.dispositivo_id)} 
                        sensor_id={String(chartConfig.sensor_id)} 
                        medida_id={String(chartConfig.medida_id)}
                    />
                </div>
            ))}
        </div>
    );
};

ChartContainer.propTypes = {
    charts: PropTypes.arrayOf(
        PropTypes.shape({
            nodo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            dispositivo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            sensor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            medida_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        })
    ).isRequired,
};

export default ChartContainer;