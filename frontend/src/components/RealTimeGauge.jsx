import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { Snackbar, Alert } from "@mui/material";

const RealTimeGauge = ({ nodo_id, dispositivo_id, sensor_id, medida_id }) => {
    const [value, setValue] = useState(0);
    const [limits, setLimits] = useState({ max: 100, min: 0 });
    const [measureName, setMeasureName] = useState("");
    const [unidad, setUnidad] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // Obtener límites y nombre de la medida
    useEffect(() => {
        const fetchMeasure = async () => {
            try {
                const res = await fetch("https://measures-service-production.up.railway.app/api/measures/");
                const data = await res.json();
                const measure = data.find(
                    (m) =>
                        String(m.measure_id) === String(medida_id) ||
                        String(m.medida_id) === String(medida_id)
                );

                if (measure) {
                    console.log("Medida encontrada:", measure);
                    setLimits({ min: measure.min, max: measure.max });
                    setMeasureName(measure.nombre_medida);
                    setUnidad(measure.unidad_medida || "");
                } else {
                    console.warn("No se encontró la medida.");
                }
            } catch (err) {
                console.error("Error obteniendo la medida:", err);
            }
        };

        fetchMeasure();
    }, [medida_id]);

    // Conexión WebSocket y procesamiento de datos
    useEffect(() => {
        const socket = io("https://infdb-service-production.up.railway.app", {
            transports: ["websocket"],
        });

        socket.on("connect", () => console.log("WebSocket conectado ✅"));
        socket.on("disconnect", () => console.warn("WebSocket desconectado ❌"));

        socket.on("real_time_data", (message) => {
            try {
                const parsedData = JSON.parse(message);
                console.log("Mensaje recibido:", parsedData);

                const filtered = Array.isArray(parsedData)
                    ? parsedData
                          .filter(
                              (p) =>
                                  String(p.nodo_id) === String(nodo_id) &&
                                  String(p.dispositivo_id) === String(dispositivo_id) &&
                                  String(p.sensor_id) === String(sensor_id) &&
                                  String(p.medida_id) === String(medida_id)
                          )
                          .sort((a, b) => new Date(b.time) - new Date(a.time))[0]
                    : null;

                if (filtered) {
                    console.log("Dato más reciente:", filtered);
                    setValue(filtered.valor);

                    if (limits.max && filtered.valor > limits.max) {
                        setAlertMessage(`⚠️ Valor ${filtered.valor} supera el máximo permitido (${limits.max})`);
                        setAlertOpen(true);
                    } else if (limits.min && filtered.valor < limits.min) {
                        setAlertMessage(`⚠️ Valor ${filtered.valor} está por debajo del mínimo (${limits.min})`);
                        setAlertOpen(true);
                    }
                }
            } catch (err) {
                console.error("Error procesando datos:", err);
            }
        });

        return () => socket.disconnect();
    }, [nodo_id, dispositivo_id, sensor_id, medida_id, limits]);

    const handleAlertClose = () => setAlertOpen(false);

    // Cálculo corregido del porcentaje
    const percent =
        limits.max > limits.min
            ? Math.max(0, Math.min(1, (value - limits.min) / (limits.max - limits.min)))
            : 0;

    useEffect(() => {
        console.log("⏱️ Actualización:", {
            value,
            min: limits.min,
            max: limits.max,
            percent: (percent * 100).toFixed(2) + "%",
        });
    }, [value, limits, percent]);

    return (
        <div className="flex flex-col items-center w-full p-4" style={{ backgroundColor: "#1f2937", border: "1.5px solid white", borderRadius: "8px" }}>
            <h2 style={{ color: "white" }}>{measureName || "Cargando..."}</h2>
            <p style={{ color: "white", marginBottom: "5px" }}>{value} {unidad}</p>
            <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "10px" }}>
                Porcentaje: {(percent * 100).toFixed(1)}%
            </p>

            {measureName && !isNaN(percent) && (
                <div style={{ width: "350px" }}>
                    <GaugeChart
                        id={`gauge-chart-${nodo_id}-${dispositivo_id}-${sensor_id}-${medida_id}`}
                        nrOfLevels={30}
                        percent={percent}
                        colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                        arcWidth={0.3}
                        textColor="#fff"
                        animate={true}
                    />
                </div>
            )}

            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleAlertClose} severity="warning" sx={{ width: "100%" }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

RealTimeGauge.propTypes = {
    nodo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dispositivo_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sensor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    medida_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default RealTimeGauge;
