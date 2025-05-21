import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { io } from "socket.io-client";
import { Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from "@mui/material";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, annotationPlugin, Filler);

const RealTimeChart = ({ nodo_id, dispositivo_id, sensor_id, medida_id }) => {
    const [data, setData] = useState([]);
    const [limits, setLimits] = useState({ max: null, min: null });
    const [measureName, setMeasureName] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [updateInterval, setUpdateInterval] = useState(1000);
    const chartRef = useRef(null);
    const MAX_TIME_WINDOW = 60 * 1000;

    const fetchMeasureDetails = useRef(null);

    useEffect(() => {
        fetchMeasureDetails.current = async () => {
            try {
                const response = await fetch("https://measures-service-production.up.railway.app/api/measures/");
                const measures = await response.json();
                const measure = measures.find((m) => String(m.measure_id) === String(medida_id));

                if (measure) {
                    setLimits({ max: measure.max, min: measure.min });
                    setMeasureName(measure.nombre_medida);
                } else {
                    console.warn(`No se encontraron detalles para medida_id: ${medida_id}`);
                }
            } catch (error) {
                console.error("Error al obtener los detalles de la medida:", error);
            }
        };

        fetchMeasureDetails.current();
    }, [medida_id]);

    useEffect(() => {
        const socket = io("https://infdb-service-production.up.railway.app", {
            transports: ["websocket"],
        });

        let lastUpdateTime = Date.now();

        const handleData = (message) => {
            const now = Date.now();
            if (now - lastUpdateTime < updateInterval) return;
            lastUpdateTime = now;

            try {
                const parsedData = JSON.parse(message);

                const filteredData = parsedData.filter((point) =>
                    [nodo_id, dispositivo_id, sensor_id, medida_id].every((id, index) =>
                        String(point[["nodo_id", "dispositivo_id", "sensor_id", "medida_id"][index]]).trim() === String(id).trim()
                    )
                );

                if (filteredData.length) {
                    const newData = filteredData.map((point) => ({
                        x: new Date(point._time).getTime(),
                        y: point._value,
                    })).sort((a, b) => a.x - b.x);

                    const now = Date.now();
                    setData((prevData) => {
                        const updated = [...prevData, ...newData];
                        return updated.filter((d) => now - d.x <= MAX_TIME_WINDOW);
                    });
                }
            } catch (error) {
                console.error("❌ Error procesando los datos recibidos:", error);
            }
        };

        socket.on("connect", () => console.log("✅ Conectado al WebSocket."));
        socket.on("real_time_data", handleData);

        return () => {
            socket.off("real_time_data", handleData);
            socket.disconnect();
        };
    }, [nodo_id, dispositivo_id, sensor_id, medida_id, updateInterval]);

    useEffect(() => {
        if (limits.max !== null && limits.min !== null && data.length) {
            const last = data[data.length - 1];
            if (last.y > limits.max) {
                setAlertMessage(`El valor ${last.y} superó el límite máximo (${limits.max})`);
                setAlertOpen(true);
            } else if (last.y < limits.min) {
                setAlertMessage(`El valor ${last.y} está por debajo del límite mínimo (${limits.min})`);
                setAlertOpen(true);
            }
        }
    }, [data, limits]);

    const handleAlertClose = () => setAlertOpen(false);

    const chartData = {
        datasets: [
            {
                label: `Sensor ${sensor_id} - ${measureName || "Medida"}`,
                data,
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
                time: { unit: "second" },
                title: { display: true, text: "Tiempo" },
            },
            y: {
                title: { display: true, text: "Valor" },
            },
        },
        plugins: {
            annotation: {
                annotations: {
                    ...(limits.max && {
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
                                font: { size: 12, weight: "bold" },
                            },
                        },
                    }),
                    ...(limits.min && {
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
                                font: { size: 12, weight: "bold" },
                            },
                        },
                    }),
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => context.raw ? `Valor: ${context.raw.y}` : null,
                },
            },
        },
    };

    return (
        <div className="relative flex flex-col items-center w-full p-4" style={{ backgroundColor: '#1f2937', border: '1.5px solid white', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ color: "white", marginBottom: "10px" }}>{measureName || "Cargando medida..."}</h2>

            <div className="flex justify-between w-full mb-4">
                <FormControl variant="outlined" style={{ minWidth: 200 }}>
                    <InputLabel id="update-interval-label" style={{ color: "white" }}>Intervalo de actualización</InputLabel>
                    <Select
                        labelId="update-interval-label"
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
                {data.length ? (
                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                ) : (
                    <p style={{ color: "white", textAlign: "center" }}>Esperando datos...</p>
                )}
            </div>

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
