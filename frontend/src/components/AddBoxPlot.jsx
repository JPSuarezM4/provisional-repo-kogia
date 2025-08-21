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
};

export default function AddBoxPlot({ nodo_id, dispositivo_id, sensor_id, medida_id, onDelete }) {
  const [data, setData] = useState([]); // aquí guardamos objetos {timestamp, value}
  const [unidad, setUnidad] = useState("");
  const [timeRange, setTimeRange] = useState("-4d");
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
      };
      fetchData().catch(error => console.error("Error fetching data:", error));
    }
  }, [nodo_id, dispositivo_id, sensor_id, medida_id, timeRange]);

  // Agrupar valores por día
  const grouped = {};
  data.forEach((item) => {
    if (!item.timestamp) return;
    const day = format(parseISO(item.timestamp), "yyyy-MM-dd");
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item.value);
  });

  const chartData = {
    labels: Object.keys(grouped), // cada día será una etiqueta
    datasets: [
      {
        label: `Boxplot ${medida_id} (${unidad})`,
        data: Object.values(grouped), // cada grupo es un array de valores (boxplot)
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
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
        text: "Boxplot de valores por día",
      },
    },
    scales: {
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
      const chartInstance = chartRef.current;
      const url = chartInstance.toBase64Image();
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
        height: "350px",
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

      <FormControl variant="outlined" className="mt-2 w-1/2" style={{ color: "white" }}>
        <InputLabel style={{ color: "white" }}>Rango de tiempo</InputLabel>
        <Select value={timeRange} onChange={handleTimeRangeChange} label="Rango de tiempo" style={{ color: "white" }}>
          <MenuItem value="-1d">Último día</MenuItem>
          <MenuItem value="-7d">Última semana</MenuItem>
          <MenuItem value="-30d">Último mes</MenuItem>
          <MenuItem value="-90d">Últimos 3 meses</MenuItem>
        </Select>
      </FormControl>

      <div style={{ width: "500px", height: "250px", overflow: "hidden" }}>
        <Chart ref={chartRef} type="boxplot" data={chartData} options={chartOptions} />
      </div>

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
