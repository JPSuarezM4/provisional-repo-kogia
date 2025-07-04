import { useEffect, useRef, useState } from "react";
import GaugeChart from "react-gauge-chart";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { Snackbar, Alert } from "@mui/material";

const RealTimeGauge = ({ nodo_id, dispositivo_id, sensor_id, medida_id }) => {
    const [value, setValue] = useState(0);
    const [limits, setLimits] = useState({ min: null, max: null });
    const [measureName, setMeasureName] = useState("");
    const [unidad, setUnidad] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const valueHistoryRef = useRef([]);
    const SMOOTHING_WINDOW = 5;

    const gaugeRanges = {
        1: { min: 0, max: 100 },
        2: { min: 0, max: 10 },
        3: { min: 0, max: 50 },
        4: { min: 0, max: 500 },
    };

    const gaugeLimit = gaugeRanges[medida_id] || { min: 0, max: 100 };

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
                    setLimits({
                        min: typeof measure.min === "number" ? measure.min : null,
                        max: typeof measure.max === "number" ? measure.max : null,
                    });
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

    useEffect(() => {
        const socket = io("https://infdb-service-production.up.railway.app", {
            transports: ["websocket"],
        });

        socket.on("connect", () => console.log("✅ WebSocket conectado"));
        socket.on("disconnect", () => console.warn("❌ WebSocket desconectado"));

        socket.on("real_time_data", (message) => {
            try {
                const parsedData = JSON.parse(message);
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
                    // Suavizado simple
                    valueHistoryRef.current = [
                        ...valueHistoryRef.current,
                        filtered.valor,
                    ].slice(-SMOOTHING_WINDOW);
                    const promedio =
                        valueHistoryRef.current.reduce((a, b) => a + b, 0) /
                        valueHistoryRef.current.length;
                    setValue(Number(promedio.toFixed(2)));

                    // Alertas con valor crudo
                    if (limits.max !== null && filtered.valor > limits.max) {
                        setAlertMessage(`⚠️ Valor ${filtered.valor} supera el máximo permitido (${limits.max})`);
                        setAlertOpen(true);
                    } else if (limits.min !== null && filtered.valor < limits.min) {
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

    const percent =
        gaugeLimit.max > gaugeLimit.min
            ? Math.max(0, Math.min(1, (value - gaugeLimit.min) / (gaugeLimit.max - gaugeLimit.min)))
            : 0;

    useEffect(() => {
        console.log("Gauge:", {
            valor: value,
            porcentaje: (percent * 100).toFixed(2) + "%",
            rango_visual: gaugeLimit,
            limites_alerta: limits,
        });
    }, [value, percent]);

    return (
        <div className="relative flex flex-col items-center w-full p-4" style={{ position:"relative", backgroundColor: '#1f2937', border: '1.5px solid white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <h2 style={{ color: "white" }}>{measureName || "Cargando..."}</h2>
            <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "10px" }}>
                Porcentaje: {(percent * 100).toFixed(1)}%
            </p>

            {measureName && !isNaN(percent) && (
            <div style={{ position: "relative", width: "350px", height: "200px" }}>
                <GaugeChart
                    id={`gauge-chart-${nodo_id}-${dispositivo_id}-${sensor_id}-${medida_id}`}
                    nrOfLevels={30}
                    percent={percent}
                    colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                    arcWidth={0.3}
                    textColor="#fff"
                    animate={true}
                    hideText={true}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold",
                        textAlign: "center",
                    }}
                >
                    {value} {unidad}
                </div>
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
