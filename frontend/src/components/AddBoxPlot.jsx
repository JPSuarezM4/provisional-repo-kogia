import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Chart } from "react-chartjs-2";
import { IconButton, Menu, MenuItem, Select, FormControl, InputLabel, Tooltip, Checkbox, FormControlLabel } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { parseISO, format, subDays } from "date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import {
  BoxPlotController,
  BoxAndWiskers,
  ViolinController,
  Violin,
} from "@sgratzl/chartjs-chart-boxplot";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  ChartTooltip,
  Legend,
  BoxPlotController,
  BoxAndWiskers,
  ViolinController,
  Violin
);

const AddBoxPlot = forwardRef(function AddBoxPlot({
  id,
  nodo_id,
  dispositivo_id,
  sensor_id,
  medida_id,
  onDelete,
  onSelect,
  selected,
  timeRange,
  processingType,
  onProcessingTypeChange,
  onTimeRangeChange,
}, ref) {
  const [data, setData] = useState([]);
  const [unidad, setUnidad] = useState("");
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  function processValues(values) {
    if (processingType === "normalize") {
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (max === min) return values.map(() => 0.5);
      return values.map((v) => (v - min) / (max - min));
    }
    if (processingType === "log") {
      return values.map((v) => Math.log(v + 1));
    }
    return values;
  }

  function allEqual(arr) {
    return arr.every((v) => v === arr[0]);
  }

  useEffect(() => {
    if (nodo_id && dispositivo_id && sensor_id && medida_id) {
      const fetchData = async () => {
        const responseInflux = await axios.get(
          `https://infdb-service-production.up.railway.app/get_data?nodo_id=${nodo_id}&medida_id=${medida_id}&dispositivo_id=${dispositivo_id}&sensor_id=${sensor_id}&rango=${timeRange}`
        );

        const influxData = responseInflux.data.map((item) => ({
          timestamp: item._time || item.time,
          value: item.valor,
        }));

        const responseMedida = await axios.get(
          `https://sensor-service-production.up.railway.app/api/nodos/${nodo_id}/dispositivos/${dispositivo_id}/sensor/${sensor_id}/medidas/${medida_id}`
        );
        setUnidad(responseMedida.data.medida.unidad);

        setData(influxData);
        console.log("Datos recibidos:", influxData);
      };
      fetchData().catch((error) => console.error("Error fetching data:", error));
    }
  }, [nodo_id, dispositivo_id, sensor_id, medida_id, timeRange]);

  const MAX_POINTS = 1000;

  let labels = [];
  let boxplotData = [];
  let boxplotDataProcessed = [];
  let grouped = {};

  if (["-30d", "-90d", "-365d"].includes(timeRange)) {
    if (data.length > 0) {
      const originalAll = data.map((item) => item.value);
      const firstDate = format(parseISO(data[0].timestamp), "yyyy-MM-dd");
      const lastDate = format(parseISO(data[data.length - 1].timestamp), "yyyy-MM-dd");
      labels = [`${firstDate} a ${lastDate}`];
      boxplotData = [originalAll];
      boxplotDataProcessed = [processValues(originalAll)];
      grouped["rango"] = data.map(item => ({ timestamp: item.timestamp, value: item.value }));
    } else {
      labels = ["Sin datos"];
      boxplotData = [[]];
      boxplotDataProcessed = [[]];
      grouped["rango"] = [];
    }
  } else {
    data.forEach((item) => {
      if (!item.timestamp) return;
      const day = format(parseISO(item.timestamp), "yyyy-MM-dd");
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({ timestamp: item.timestamp, value: item.value });
    });

    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(format(subDays(today, i), "yyyy-MM-dd"));
    }
    labels = days;
    boxplotData = days.map(day => (grouped[day] ? grouped[day].map(obj => obj.value) : []));
    boxplotDataProcessed = days.map(day =>
      grouped[day] ? processValues(grouped[day].map(obj => obj.value)) : []
    );
  }

  const showProcessedChart =
    processingType !== "none" &&
    boxplotDataProcessed.some(arr => !allEqual(arr));

  const limitedBoxplotData = boxplotData.map(values =>
    values.length > MAX_POINTS ? values.slice(-MAX_POINTS) : values
  );

  const limitedBoxplotDataProcessed = boxplotDataProcessed.map(values =>
    values.length > MAX_POINTS ? values.slice(-MAX_POINTS) : values
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: `Original ${medida_id} (${unidad})`,
        data: limitedBoxplotData,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        outlierColor: "#ff7300",
      },
    ],
  };

  const chartDataProcessed = {
    labels,
    datasets: [
      {
        label: `Procesado (${processingType})`,
        data: limitedBoxplotDataProcessed,
        backgroundColor: "#4caf50",
        borderColor: "#4caf50",
        outlierColor: "#ff7300",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "Boxplot de valores tiempo" },
    },
    scales: {
      x: { ticks: { maxRotation: 90, minRotation: 60, autoSkip: false } },
      y: { title: { display: true, text: unidad } },
    },
  };


  const exportToPNG = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `boxplot_${sensor_id}_${timestamp}.png`;
      link.click();
    }
  };

  const handleSelectChange = (e) => {
    if (onSelect) {
      let processedWithDate = [];
      if (processingType === "none") {
        labels.forEach((day, i) => {
          const values = boxplotData[i] || [];
          const timestamps = grouped[day] ? grouped[day].map(obj => obj.timestamp) : [];
          values.forEach((value, j) => {
            processedWithDate.push({
              date: timestamps[j]
                ? format(parseISO(timestamps[j]), "dd/MM/yyyy HH:mm:ss")
                : "",
              value
            });
          });
        });
      } else {
        labels.forEach((day, i) => {
          const originalValues = boxplotData[i] || [];
          const processedValues = processValues(originalValues);
          const timestamps = grouped[day] ? grouped[day].map(obj => obj.timestamp) : [];
          const len = Math.min(processedValues.length, timestamps.length);
          for (let j = 0; j < len; j++) {
            processedWithDate.push({
              date: timestamps[j]
                ? format(parseISO(timestamps[j]), "dd/MM/yyyy HH:mm:ss")
                : "",
              value: processedValues[j]
            });
          }
        });
      }

      console.log("Exportando:", processedWithDate);

      onSelect(e.target.checked, processedWithDate, processingType);
    }
  };


  const handleProcessingChange = (e) => {
    if (onProcessingTypeChange) {
      onProcessingTypeChange(e.target.value);
    }
    if (selected) {
      handleSelectChange({ target: { checked: true } });
    }
  };

  const handleTimeRangeChange = (e) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(e.target.value);
    }
    if (selected) {
      handleSelectChange({ target: { checked: true } });
    }
  };

  // 🔹 Exponer función pública para forzar actualización
  useImperativeHandle(ref, () => ({
    forceSelectUpdate: () => {
      handleSelectChange({ target: { checked: true } });
    }
  }));

  return (
    <div
      className="relative flex flex-col items-center p-4"
      style={{
        backgroundColor: "#1f2937",
        border: "1.5px solid white",
        borderRadius: "8px",
        width: "500px",
        minHeight: "600px",
      }}
    >
      <IconButton
        aria-label="more"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="absolute top-2 right-2"
        style={{ color: "white" }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={exportToPNG} style={{ color: "black" }}>
          Exportar como PNG
        </MenuItem>
      </Menu>

      <FormControlLabel
        control={
          <Checkbox
            checked={selected}
            onChange={handleSelectChange}
            color="primary"
          />
        }
        style={{ alignSelf: "flex-start", marginBottom: 8, color: "white" }}
      />

      <FormControl variant="outlined" className="mt-2 w-1/2" style={{ color: "white" }}>
        <InputLabel style={{ color: "white" }}>Rango de tiempo</InputLabel>
        <Select value={timeRange} onChange={handleTimeRangeChange} label="Rango de tiempo" style={{ color: "white" }}>
          <MenuItem value="-1d">Último día</MenuItem>
          <MenuItem value="-7d">Última semana</MenuItem>
          <MenuItem value="-30d">Último mes</MenuItem>
          <MenuItem value="-90d">Últimos 3 meses</MenuItem>
          <MenuItem value="-365d">Último año</MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" className="mt-2 w-1/2" style={{ color: "white" }}>
        <InputLabel style={{ color: "white" }}>Procesamiento</InputLabel>
        <Select
          value={processingType}
          onChange={handleProcessingChange}
          label="Procesamiento"
          style={{ color: "white" }}
        >
          <MenuItem value="none">Original</MenuItem>
          <MenuItem value="normalize">Normalizado</MenuItem>
          <MenuItem value="log">Logaritmo</MenuItem>
        </Select>
      </FormControl>

      <div style={{ width: "500px", height: "250px" }}>
        <Chart ref={chartRef} type="boxplot" data={chartData} options={chartOptions} />
      </div>

      {processingType !== "none" && showProcessedChart && (
        <div style={{ width: "500px", height: "250px", marginTop: 16 }}>
          <Chart type="boxplot" data={chartDataProcessed} options={chartOptions} />
        </div>
      )}

      {processingType !== "none" && !showProcessedChart && (
        <div
          style={{
            width: "500px",
            height: "250px",
            marginTop: 16,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Todos los valores normalizados son iguales. No se puede mostrar el boxplot procesado.</span>
        </div>
      )}

      <Tooltip title="Eliminar gráfico">
        <IconButton
          aria-label="delete chart"
          onClick={() => onDelete(id)}
          className="absolute top-2 right-8"
          style={{ borderRadius: "50%", color: "white" }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
});

AddBoxPlot.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nodo_id: PropTypes.string.isRequired,
  dispositivo_id: PropTypes.string.isRequired,
  sensor_id: PropTypes.string.isRequired,
  medida_id: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  processingType: PropTypes.string.isRequired,
  onProcessingTypeChange: PropTypes.func.isRequired,
  timeRange: PropTypes.string.isRequired,
  onTimeRangeChange: PropTypes.func.isRequired,
};

export default AddBoxPlot;