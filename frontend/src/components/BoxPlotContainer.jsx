import { useCallback } from "react";
import AddBoxPlot from "./AddBoxPlot";
import PropTypes from "prop-types";

const BoxPlotContainer = ({ charts, onDeleteChart, onSelectBoxPlot }) => {
    // función estable para manejar el select
    const handleSelect = useCallback(
        (chartId, selected, processedData, processingType) => {
            onSelectBoxPlot(chartId, selected, processedData, processingType);
        },
        [onSelectBoxPlot] // ✅ solo cambia si cambia la prop
    );

    // función estable para manejar el delete
    const handleDelete = useCallback(
        (chartId) => {
            onDeleteChart(chartId);
        },
        [onDeleteChart]
    );

    return (
        <>
            {charts.map((chartConfig) => (
                <AddBoxPlot
                    key={chartConfig.id}
                    nodo_id={chartConfig.nodo_id}
                    dispositivo_id={chartConfig.dispositivo_id}
                    sensor_id={chartConfig.sensor_id}
                    medida_id={chartConfig.medida_id}
                    onDelete={() => handleDelete(chartConfig.id)}
                    onSelect={(selected, processedData, processingType) =>
                        handleSelect(chartConfig.id, selected, processedData, processingType)
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
