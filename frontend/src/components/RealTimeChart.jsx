import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { io } from "socket.io-client";
import { Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from "@mui/material";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, annotationPlugin, Filler);

const RealTimeChart = ({ nodo_id, dispositivo_id, sensor_id, medida_id }) => {
    const [data, setData] = useState([]); // Datos en tiempo real
    const [limits, setLimits] = useState({ max: null, min: null }); // Límites de la medida
    const [measureName, setMeasureName] = useState(""); // Nombre de la medida
    const [alertOpen, setAlertOpen] = useState(false); // Estado para mostrar la alerta
    const [alertMessage, setAlertMessage] = useState(""); // Mensaje de la alerta
    const chartRef = useRef(null);
    const [updateInterval, setUpdateInterval] = useState(1000); // Intervalo en milisegundos (por defecto 1 segundo)

    // Obtener los límites `max`, `min` y el nombre de la medida desde la API
    useEffect(() => {
        const fetchMeasureDetails = async () => {
            try {
                const response = await fetch("https://measures-service-production.up.railway.app/api/measures/");
                const measures = await response.json();
                const measure = measures.find((m) => String(m.measure_id) === String(medida_id));

                if (measure) {
                    setLimits({ max: measure.max, min: measure.min });
                    setMeasureName(measure.nombre_medida); // Guardar el nombre de la medida
                } else {
                    console.warn(`No se encontraron detalles para medida_id: ${medida_id}`);
                }
            } catch (error) {
                console.error("Error al obtener los detalles de la medida:", error);
            }
        };

        fetchMeasureDetails();
    }, [medida_id]);

    // Conexión al WebSocket para datos en tiempo real
    useEffect(() => {
        const socket = io("https://infdb-service-production.up.railway.app", { transports: ["websocket"] });

        socket.on("connect", () => {
            console.log("✅ Conectado al WebSocket con Socket.IO.");
        });

        socket.on("real_time_data", (message) => {
            try {
                const parsedData = JSON.parse(message);
                console.log("📦 Datos recibidos:", parsedData);

                // Filtrar datos específicos para este medida_id
                const filteredData = parsedData.filter((point) => {
                    return (
                        String(point.nodo_id).trim() === String(nodo_id).trim() &&
                        String(point.dispositivo_id).trim() === String(dispositivo_id).trim() &&
                        String(point.sensor_id).trim() === String(sensor_id).trim() &&
                        String(point.medida_id).trim() === String(medida_id).trim()
                    );
                });

                console.log("Datos filtrados:", filteredData);

                if (filteredData.length > 0) {
                    const newData = filteredData.map((point, index) => ({
                        x: new Date(point._time).getTime() + index * 100, // Añadir un pequeño retraso para evitar solapamientos
                        y: point._value,
                    }));

                    setData((prevData) => {
                        const updatedData = [...prevData, ...newData];
                        // Limitar los puntos a un número razonable para evitar sobrecarga
                        return updatedData.slice(-50); // Mantener solo los últimos 50 puntos
                    });
                } else {
                    console.warn(`No se encontraron datos para medida_id: ${medida_id}`);
                }
            } catch (error) {
                console.error("❌ Error procesando los datos recibidos:", error);
            }
        });

        return () => {
            socket.disconnect(); // Desconectar el socket al desmontar el componente
        };
    }, [nodo_id, dispositivo_id, sensor_id, medida_id]);

    // Detectar si los valores superan los límites
    useEffect(() => {
        if (limits.max !== null && limits.min !== null) {
            const lastPoint = data[data.length - 1]; // Obtener el último punto de datos
            if (lastPoint) {
                if (lastPoint.y > limits.max) {
                    setAlertMessage(`El valor ${lastPoint.y} superó el límite máximo (${limits.max})`);
                    setAlertOpen(true);
                } else if (lastPoint.y < limits.min) {
                    setAlertMessage(`El valor ${lastPoint.y} está por debajo del límite mínimo (${limits.min})`);
                    setAlertOpen(true);
                }
            }
        }
    }, [data, limits]);

    // Cerrar la alerta
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    // Configuración del gráfico
    const chartData = {
        datasets: [
            {
                label: `Sensor ${sensor_id} - Medida ${medida_id}`,
                data: data,
                borderColor: "#42A5F5",
                backgroundColor: "rgba(66, 165, 245, 0.2)",
                tension: 0.1,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
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
                    unit: "second",
                },
                title: {
                    display: true,
                    text: "Tiempo",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Valor",
                },
            },
        },
        plugins: {
            annotation: {
                annotations: {
                    maxLine: {
                        type: "line",
                        yMin: limits.max,
                        yMax: limits.max,
                        borderColor: "#F5DEB3",
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: "Máximo",
                            enabled: true,
                            position: "end",
                            backgroundColor: "rgba(245, 222, 179, 0.7)",
                            font: {
                                size: 12,
                                weight: "bold",
                            },
                        },
                    },
                    minLine: {
                        type: "line",
                        yMin: limits.min,
                        yMax: limits.min,
                        borderColor: "#F5DEB3",
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: "Mínimo",
                            enabled: true,
                            position: "end",
                            backgroundColor: "rgba(245, 222, 179, 0.7)",
                            font: {
                                size: 12,
                                weight: "bold",
                            },
                        },
                    },
                },
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        if (context.raw) {
                            return `Valor: ${context.raw.y}`;
                        }
                        return null;
                    },
                },
            },
        },
    };

    return (
        <div className="relative flex flex-col items-center w-full p-4" style={{ backgroundColor: '#1f2937', border: '1.5px solid white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            {/* Mostrar el nombre de la medida */}
            <h2 style={{ color: "white", marginBottom: "10px" }}>{measureName || "Cargando medida..."}</h2>

            <div className="flex justify-between w-full mb-4">
                <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel style={{ color: "white" }}>Intervalo de actualización</InputLabel>
                    <Select
                        value={updateInterval}
                        onChange={(e) => setUpdateInterval(Number(e.target.value))}
                        style={{ color: "white", backgroundColor: "#374151" }}
                    >
                        <MenuItem value={500}>500 ms</MenuItem>
                        <MenuItem value={1000}>1 segundo</MenuItem>
                        <MenuItem value={2000}>2 segundos</MenuItem>
                        <MenuItem value={5000}>5 segundos</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div style={{ width: "500px", height: "250px", overflow: "hidden" }}>
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>

            {/* Alerta con Material-UI */}
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity="warning" sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};
RealTimeChart.propTypes = {
    nodo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dispositivo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sensor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    medida_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};


export default RealTimeChart;
