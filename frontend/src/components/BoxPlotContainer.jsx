import { useCallback } from "react";
import AddBoxPlot from "./AddBoxPlot";
import PropTypes from "prop-types";

const BoxPlotContainer = ({ charts, onDeleteChart, onSelectBoxPlot, selectedCharts, processingType, onProcessingTypeChange, timeRanges, onTimeRangeChange }) => {
    const handleDelete = useCallback(
        (chartId) => {
            onDeleteChart(chartId);
        },
        [onDeleteChart]
    );

    const handleSelect = useCallback(
        (chartId, selected, processedData, processingType) => {
            onSelectBoxPlot(chartId, selected, processedData, processingType);
        },
        [onSelectBoxPlot]
    );

    return (
        <>
            {charts.map((chartConfig) => (
                <AddBoxPlot
                    key={chartConfig.id}
                    id={chartConfig.id}
                    nodo_id={chartConfig.nodo_id}
                    dispositivo_id={chartConfig.dispositivo_id}
                    sensor_id={chartConfig.sensor_id}
                    medida_id={chartConfig.medida_id}
                    selected={!!selectedCharts?.[chartConfig.id]}
                    processingType={processingType?.[chartConfig.id] || "none"}
                    timeRange={timeRanges?.[chartConfig.id] || "-4d"}
                    onDelete={() => handleDelete(chartConfig.id)}
                    onSelect={(selected, processedData, processingType) =>
                        handleSelect(chartConfig.id, selected, processedData, processingType)
                    }
                    onProcessingTypeChange={(type) => onProcessingTypeChange(chartConfig.id, type)}
                    onTimeRangeChange={(range) => onTimeRangeChange(chartConfig.id, range)}
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
    processingType: PropTypes.object.isRequired,
    onProcessingTypeChange: PropTypes.func.isRequired,
    selectedCharts: PropTypes.object.isRequired,
    timeRanges: PropTypes.object.isRequired,
    onTimeRangeChange: PropTypes.func.isRequired,
};

export default BoxPlotContainer;