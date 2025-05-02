import SensorChart from './AddChart';
import PropTypes from 'prop-types';

const ChartContainer = ({ charts }) => {
    return (
        <>
            {charts.map((chartConfig, index) => (
                <SensorChart
                    key={index}
                    nodo_id={chartConfig.nodo_id}
                    dispositivo_id={chartConfig.dispositivo_id}
                    sensor_id={chartConfig.sensor_id}
                    medida_id={chartConfig.medida_id}
                />
            ))}
        </>
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