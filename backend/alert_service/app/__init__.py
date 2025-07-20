from flask import Flask, jsonify
from app.influx import read_measurements
from app.alerts import get_limits, check_limits, send_email_alert
import logging

# Configura el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_data():
    # Usamos el nombre fijo del measurement
    measurement_name = "mediciones_dht11_v2"
    return read_measurements(measurement_name)

def create_app():
    app = Flask(__name__)

    @app.route("/check-alerts/<int:medida_id>", methods=["GET"])
    def check_alerts(medida_id):
        limits = get_limits(medida_id)
        logger.info(f"Límites obtenidos: {limits}")
        if not limits:
            return jsonify({"error": "No se pudieron obtener los límites"}), 500

        # Obtener los datos del measurement fijo
        data = get_data()
        logger.info(f"Datos obtenidos: {data}")
        print("Datos obtenidos:", data)  # Para pruebas

        if not data or not isinstance(data, list) or len(data) == 0:
            return jsonify({"error": "No se pudieron obtener los datos"}), 500

        # Filtrar los datos por medida_id
        valores_filtrados = [d for d in data if d.get("medida_id") == medida_id]
        if not valores_filtrados:
            return jsonify({"error": f"No se encontraron datos para la medida {medida_id}"}), 404

        # Suponiendo que el último dato tiene clave 'valor'
        valor = valores_filtrados[0].get("valor")
        logger.info(f"Valor leído: {valor}")
        if valor is None:
            return jsonify({"error": "Dato inválido"}), 500

        if valor < limits["min"] or valor > limits["max"]:
            send_email_alert(
                subject=f"Alerta para {limits['nombre_medida']}",
                body=f"Valor {valor} fuera de los límites: {limits['min']} - {limits['max']}"
            )
            return jsonify({
                "alerta": True,
                "valor": valor,
                "limites": {"min": limits["min"], "max": limits["max"]},
                "mensaje": "El valor está fuera del rango permitido."
            }), 200

        return jsonify({
            "alerta": False,
            "valor": valor,
            "mensaje": "Todo está dentro de los límites."
        }), 200

    return app
