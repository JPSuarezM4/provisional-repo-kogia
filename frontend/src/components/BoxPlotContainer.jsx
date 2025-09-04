import AddBoxPlot from './AddBoxPlot';
import PropTypes from 'prop-types';

const BoxPlotContainer = ({ charts, onDeleteChart, onSelectBoxPlot }) => {
    return (
        <>
            {charts.map((chartConfig) => (
                <AddBoxPlot
                    key={chartConfig.id}
                    nodo_id={chartConfig.nodo_id}
                    dispositivo_id={chartConfig.dispositivo_id}
                    sensor_id={chartConfig.sensor_id}
                    medida_id={chartConfig.medida_id}
                    onDelete={() => onDeleteChart(chartConfig.id)}
                    onSelect={(selected, processedData, processingType) =>
                        onSelectBoxPlot(chartConfig.id, selected, processedData, processingType)
                    }
                />
            ))}
        </>
    );
};

BoxPlotContainer.propTypes = {
    charts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            nodo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            dispositivo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            sensor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            medida_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        })
    ).isRequired,
    onDeleteChart: PropTypes.func.isRequired,
    onSelectBoxPlot: PropTypes.func.isRequired,
};

export default BoxPlotContainer;