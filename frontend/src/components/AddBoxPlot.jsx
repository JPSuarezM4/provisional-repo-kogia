import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Chart } from "react-chartjs-2";
import { IconButton, Menu, MenuItem, Select, FormControl, InputLabel, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
// import RefreshIcon from "@mui/icons-material/Refresh";

import { parseISO, format } from "date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import { Checkbox, FormControlLabel } from "@mui/material";

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

AddBoxPlot.propTypes = {
  nodo_id: PropTypes.string.isRequired,
  dispositivo_id: PropTypes.string.isRequired,
  sensor_id: PropTypes.string.isRequired,
  medida_id: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};



export default function AddBoxPlot({ nodo_id, dispositivo_id, sensor_id, medida_id, onDelete, onSelect }) {
  const [data, setData] = useState([]); // aquí guardamos objetos {timestamp, value}
  const [unidad, setUnidad] = useState("");
  const [timeRange, setTimeRange] = useState("-4d");
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [processingType, setProcessingType] = useState("none"); // none, normalize, log, etc.
  const [selected, setSelected] = useState(false);

  function processValues(values) {
    if (processingType === "normalize") {
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (max === min) {
        // Todos los valores son iguales, devuelve un array con el mismo valor
        return values.map(() => 0.5); 
      }
      return values.map(v => (v - min) / (max - min));
    }
    if (processingType === "log") {
      return values.map(v => Math.log(v + 1));
    }
    return values;
  }
  
  function allEqual(arr) {
    return arr.every(v => v === arr[0]);
  }



  useEffect(() => {
    if (nodo_id && dispositivo_id && sensor_id && medida_id) {
      const fetchData = async () => {
        // Obtener datos de InfluxDB
        const responseInflux = await axios.get(
          `https://infdb-service-production.up.railway.app/get_data?nodo_id=${nodo_id}&medida_id=${medida_id}&dispositivo_id=${dispositivo_id}&sensor_id=${sensor_id}&rango=${timeRange}`
        );

        // ahora guardamos valor + timestamp
        const influxData = responseInflux.data.map(item => ({
          timestamp: item._time || item.time, // depende de cómo venga de Influx
          value: item.valor,
        }));

        // Obtener unidad de medida
        const responseMedida = await axios.get(
          `https://sensor-service-production.up.railway.app/api/nodos/${nodo_id}/dispositivos/${dispositivo_id}/sensor/${sensor_id}/medidas/${medida_id}`
        );
        setUnidad(responseMedida.data.medida.unidad);

        setData(influxData);
        console.log("Datos recibidos:", influxData);
      };
      fetchData().catch(error => console.error("Error fetching data:", error));
    }
  }, [nodo_id, dispositivo_id, sensor_id, medida_id, timeRange]);

    useEffect(() => {
    if (onSelect) {
      const processedData = processingType === "none" ? boxplotData : boxplotDataProcessed;
      onSelect(selected, processedData, processingType);
    }
    // eslint-disable-next-line
  }, [selected, processingType, boxplotData, boxplotDataProcessed]);

  // Agrupar valores según el rango de tiempo
  let labels = [];
  let boxplotData = [];
  let boxplotDataProcessed = [];

  let showProcessedChart = true;
  if (
    processingType === "normalize" &&
    boxplotDataProcessed.length > 0 &&
    boxplotDataProcessed[0].length > 0 &&
    allEqual(boxplotDataProcessed[0])
  ) {
    showProcessedChart = false;
  }

  if (["-30d", "-90d", "-365d"].includes(timeRange)) {
    if (data.length > 0) {
      const firstDate = format(parseISO(data[0].timestamp), "yyyy-MM-dd");
      const lastDate = format(parseISO(data[data.length - 1].timestamp), "yyyy-MM-dd");
      labels = [`${firstDate} a ${lastDate}`];
    } else {
      labels = ["Sin datos"];
    }
    const original = data.map(item => item.value);
    boxplotData = [original];
    boxplotDataProcessed = [processValues(original)];
  } else {
    const grouped = {};
    data.forEach((item) => {
      if (!item.timestamp) return;
      const day = format(parseISO(item.timestamp), "yyyy-MM-dd");
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item.value);
    });
    labels = Object.keys(grouped);
    boxplotData = Object.values(grouped);
    boxplotDataProcessed = Object.values(grouped).map(processValues);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: `Original ${medida_id} (${unidad})`,
        data: boxplotData,
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
        data: boxplotDataProcessed,
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
      title: {
        display: true,
        text: "Boxplot de valores tiempo",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const v = context.raw;
            if (v && typeof v === "object" && v.min !== undefined) {
              return `Min: ${v.min} | Q1: ${v.q1} | Median: ${v.median} | Q3: ${v.q3} | Max: ${v.max}` +
                (v.outliers?.length ? ` | Outliers: ${v.outliers.length}` : "");
            }
            if (Array.isArray(v)) {
              const sorted = [...v].sort((a, b) => a - b);
              const min = sorted[0];
              const max = sorted[sorted.length - 1];
              const median = sorted[Math.floor(sorted.length / 2)];
              const q1 = sorted[Math.floor(sorted.length / 4)];
              const q3 = sorted[Math.floor(3 * sorted.length / 4)];
              return `Min: ${min} | Q1: ${q1} | Median: ${median} | Q3: ${q3} | Max: ${max} | N: ${v.length}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 60,
          autoSkip: false,
        },
      },
      y: {
        title: {
          display: true,
          text: unidad,
        },
      },
    },
  };

  const exportToPNG = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();  // válido en v4
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `boxplot_${sensor_id}_${timestamp}.png`;
      link.click();
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <div
      className="relative flex flex-col items-center p-4"
      style={{
        backgroundColor: "#1f2937",
        border: "1.5px solid white",
        borderRadius: "8px",
        padding: "20px",
        width: "500px",
        minHeight: "600px",
      }}
    >
      <IconButton
        aria-label="more"
        onClick={handleMenuOpen}
        className="absolute top-2 right-2"
        style={{ color: "white" }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={exportToPNG} style={{ color: "black" }}>
          Exportar como PNG
        </MenuItem>
      </Menu>

      <FormControlLabel
        control={
          <Checkbox
            checked={selected}
            onChange={e => setSelected(e.target.checked)}
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
          onChange={e => setProcessingType(e.target.value)}
          label="Procesamiento"
          style={{ color: "white" }}
        >
          <MenuItem value="none">Original</MenuItem>
          <MenuItem value="normalize">Normalizado</MenuItem>
          <MenuItem value="log">Logaritmo</MenuItem>
          {/* Agrega más rutinas aquí */}
        </Select>
      </FormControl>

      <div style={{ width: "500px", height: "250px", overflow: "hidden" }}>
        <Chart ref={chartRef} type="boxplot" data={chartData} options={chartOptions} />
      </div>

      {processingType !== "none" && showProcessedChart && (
        <div style={{ width: "500px", height: "250px", overflow: "hidden", marginTop: 16 }}>
          <Chart type="boxplot" data={chartDataProcessed} options={chartOptions} />
        </div>
      )}

      {processingType !== "none" && !showProcessedChart && (
        <div style={{ width: "500px", height: "250px", overflow: "hidden", marginTop: 16, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span>Todos los valores normalizados son iguales. No se puede mostrar el boxplot procesado.</span>
        </div>
      )}


      <Tooltip title="Eliminar gráfico">
        <IconButton
          aria-label="delete chart"
          onClick={onDelete}
          className="absolute top-2 right-8"
          style={{ borderRadius: "50%", color: "white" }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}
