import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { IconButton, Menu, MenuItem, Select, FormControl, InputLabel, Tooltip, Snackbar, Alert } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, TimeScale } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";
import AddMeasureDialog from "./AddMeasureDialog";

// Registrar componentes en Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, TimeScale, zoomPlugin);

SensorChart.propTypes = {
    nodo_id: PropTypes.string.isRequired,
    dispositivo_id: PropTypes.string.isRequired,
    sensor_id: PropTypes.string.isRequired,
    medida_id: PropTypes.string.isRequired,
};

export default function SensorChart({ nodo_id, dispositivo_id, sensor_id, medida_id }) {
    const [data, setData] = useState([]);
    const [unidad, setUnidad] = useState("");
    const [medidas, setMedidas] = useState([{ nodo_id, dispositivo_id, sensor_id, medida_id }]); // Estado para manejar múltiples medidas
    const [initialUnidad, setInitialUnidad] = useState(null); // Estado para guardar la unidad de la primera medida
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para manejar la visibilidad del Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Estado para manejar el mensaje del Snackbar
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Estado para manejar la severidad del Snackbar
    const chartRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null); // Estado para el menú
    const open = Boolean(anchorEl);
    const [timeRange, setTimeRange] = useState("-4d"); // Estado para el rango de tiempo de fabrica
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para el diálogo

    useEffect(() => {
        if (nodo_id && dispositivo_id && sensor_id && medidas.length > 0) {
            const fetchData = async () => {
                const allData = await Promise.all(
                    medidas.map(async ({ nodo_id, dispositivo_id, sensor_id, medida_id }) => {
                        // Obtener datos de InfluxDB
                        const responseInflux = await axios.get(`https://infdb-service-production.up.railway.app/get_data?nodo_id=${nodo_id}&medida_id=${medida_id}&dispositivo_id=${dispositivo_id}&sensor_id=${sensor_id}&rango=${timeRange}`);
                        const dataInflux = responseInflux.data.map((item) => ({
                            x: new Date(item.time),
                            y: item.valor,
                            nodo_id,
                            dispositivo_id,
                            sensor_id,
                            medida_id,
                        }));

                        // Obtener unidad de medida correspondiente desde el nuevo endpoint
                        const responseMedida = await axios.get(`https://sensor-service-production.up.railway.app/api/nodos/${nodo_id}/dispositivos/${dispositivo_id}/sensor/${sensor_id}/medidas/${medida_id}`);
                        const unidadMedida = responseMedida.data.medida.unidad;

                        // Guardar la unidad de la primera medida
                        if (initialUnidad === null) {
                            setInitialUnidad(unidadMedida);
                        }

                        // Combinar datos de InfluxDB con unidad de medida
                        return dataInflux.map((item) => ({
                            ...item,
                            unidad: unidadMedida,
                        }));
                    })
                );
                setData(allData.flat());
                if (allData.flat().length > 0) {
                    setUnidad(allData[0][0].unidad);
                }
            };
            fetchData().catch((error) => console.error("Error fetching data:", error));
        }
    }, [nodo_id, dispositivo_id, sensor_id, medidas, timeRange, initialUnidad]);

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

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const handleDialogOpen = () => {
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleAddMeasure = async (newMedida) => {
        if (typeof newMedida === "object" && newMedida !== null) {
            newMedida = { nodo_id: newMedida.nodo_id, dispositivo_id: newMedida.dispositivo_id, sensor_id: newMedida.sensor_id, medida_id: newMedida.medida_id }; // Crear un identificador único

            // Obtener unidad de medida correspondiente desde el nuevo endpoint
            const responseMedida = await axios.get(`https://sensor-service-production.up.railway.app/api/nodos/${newMedida.nodo_id}/dispositivos/${newMedida.dispositivo_id}/sensor/${newMedida.sensor_id}/medidas/${newMedida.medida_id}`);
            const unidadMedida = responseMedida.data.medida.unidad;

            // Verificar que la nueva medida tenga la misma unidad que la inicial
            if (initialUnidad !== null && unidadMedida !== initialUnidad) {
                setSnackbarMessage(`La medida seleccionada tiene una unidad diferente (${unidadMedida}) a la unidad inicial (${initialUnidad}).`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
        }
        setMedidas((prevMedidas) => [...prevMedidas, newMedida]);
        setSnackbarMessage("Medida agregada con éxito.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setIsDialogOpen(false);
    };

    // Lista de colores para los datasets
    const colors = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7300",
        "#d0ed57",
        "#a4de6c",
        "#8884d8",
        "#8dd1e1",
        "#83a6ed",
        "#8e4585",
    ];

    // Configuración de Chart.js
    const chartData = {
        datasets: medidas.map(({ nodo_id, dispositivo_id, sensor_id, medida_id }, index) => {
            const medidaData = data.filter((item) => item.nodo_id === nodo_id && item.dispositivo_id === dispositivo_id && item.sensor_id === sensor_id && item.medida_id === medida_id);
            const unidad = medidaData.length > 0 ? medidaData[0].unidad : '';
            return {
                label: `Medida ${medida_id} (${unidad})`,
                data: medidaData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + "33", // Color con transparencia
                tension: 0.3,
            };
        }),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "day",
                    displayFormats: {
                        day: "dd/MM/yyyy",
                    },
                },
                ticks: {
                    source: 'data',
                    autoSkip: true,
                    maxTicksLimit: 10,
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
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        const { nodo_id, dispositivo_id, sensor_id, medida_id, y } = context.raw;
                        return `Nodo: ${nodo_id}, Dispositivo: ${dispositivo_id}, Sensor: ${sensor_id}, Medida: ${medida_id}, Valor: ${y}`;
                    },
                },
            },
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
        <div
                className="relative flex flex-col items-center p-4"
                style={{
                    backgroundColor: '#1f2937',
                    border: '1.5px solid white',
                    borderRadius: '8px',
                    padding: '20px',
                    width: '500px', // Ancho fijo
                    height: '350px', // Altura fija
                }}
        >

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
                <MenuItem onClick={exportToPNG} style={{ color: 'black' }}>Exportar como PNG</MenuItem>
            </Menu>

            <FormControl variant="outlined" className="mt-2 w-1/2" style={{ color: 'white' }}>
                <InputLabel style={{ color: 'white' }}>Rango de tiempo</InputLabel>
                <Select
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                    label="Rango de tiempo"
                    style={{ color: 'white' }}
                >
                    <MenuItem value="-1d">Último día</MenuItem>
                    <MenuItem value="-7d">Última semana</MenuItem>
                    <MenuItem value="-30d">Último mes</MenuItem>
                    <MenuItem value="-90d">Últimos 3 meses</MenuItem>
                </Select>
            </FormControl>

            <div style={{ width: "500px", height: "250px", overflow: "hidden" }}>
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
            <IconButton
                aria-label="reset zoom"
                onClick={resetZoom}
                className="mt-2"
                style={{ borderRadius: '50%', color: 'white' }}
            >
                <RefreshIcon />
            </IconButton>

            <Tooltip title="Agregar nueva medida">
                <IconButton
                    aria-label="add measure"
                    onClick={handleDialogOpen}
                    className="absolute top-2 right-16"
                    style={{ borderRadius: '50%', color: 'white' }}
                    sx={{ marginLeft:"2 px"}}
                >
                    <ShowChartIcon />
                </IconButton>
            </Tooltip>

            <AddMeasureDialog open={isDialogOpen} onClose={handleDialogClose} onAddMeasure={handleAddMeasure} />

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};