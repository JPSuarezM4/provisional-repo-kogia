import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";

// Registrar componentes en Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, zoomPlugin);

SensorChart.propTypes = {
    nodo_id: PropTypes.string.isRequired,
    dispositivo_id: PropTypes.string.isRequired,
    sensor_id: PropTypes.string.isRequired,
};

export default function SensorChart({ nodo_id, dispositivo_id, sensor_id }) {
    const [data, setData] = useState([]);
    const [unidad, setUnidad] = useState("");
    const chartRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null); // Estado para el menú
    const open = Boolean(anchorEl);

    useEffect(() => {
        if (nodo_id && dispositivo_id && sensor_id) {
            axios
                .get(`http://localhost:5050/get_all_data?nodo_id=${nodo_id}&dispositivo_id=${dispositivo_id}&sensor_id=${sensor_id}&rango=-4d`)
                .then((response) => {
                    const formattedData = response.data.map((item) => ({
                        x: new Date(item.time),
                        y: item.valor,
                    }));
                    setData(formattedData);
                    if (formattedData.length > 0) {
                        setUnidad(response.data[0].unidad);
                    }
                })
                .catch((error) => console.error("Error fetching data:", error));
        }
    }, [nodo_id, dispositivo_id, sensor_id]);

    const resetZoom = () => {
        if (chartRef.current) {
            chartRef.current.resetZoom();
        }
    };

    const exportToPNG = () => {
        if (chartRef.current) {
            const chartInstance = chartRef.current;
            const url = chartInstance.toBase64Image();
            const link = document.createElement("a");
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            link.href = url;
            link.download = `grafico_${sensor_id}_${timestamp}.png`;
            link.click();
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Configuración de Chart.js
    const chartData = {
        datasets: [
            {
                label: `Sensor (${unidad})`,
                data: data,
                borderColor: "#8884d8",
                backgroundColor: "rgba(136, 132, 216, 0.2)",
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "day",
                },
                title: {
                    display: true,
                    text: "Tiempo",
                },
            },
            y: {
                title: {
                    display: true,
                    text: unidad,
                },
            },
        },
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
            zoom: {
                pan: {
                    enabled: true,
                    mode: "x",
                },
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: "x",
                },
            },
        },
    };

    return (
        <div className="relative flex flex-col items-center w-full">
            {/* Menú de opciones */}
            <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                className="absolute top-2 right-2"
                style={{ color: 'white' }}
            >
                <MoreVertIcon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                <MenuItem onClick={exportToPNG}>Exportar como PNG</MenuItem>
            </Menu>

            <div className="w-full h-[300px]">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
            <IconButton
                aria-label="reset zoom"
                onClick={resetZoom}
                className="mt-2"
                style={{ borderRadius: '50%', backgroundColor: '#f0f0f0' }}
            >
                <RefreshIcon />
            </IconButton>
        </div>
    );
}
