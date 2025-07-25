from flask import Flask, jsonify
from app.influx import read_measurements
from app.alerts import get_limits, send_email_alert, get_measure_context
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)

    @app.route("/check-alerts/<int:medida_id>", methods=["GET"])
    def check_alerts(medida_id):
        limits = get_limits(medida_id)
        logger.info(f"Límites obtenidos: {limits}")
        if not limits:
            return jsonify({"error": "No se pudieron obtener los límites"}), 500

        data = read_measurements(medida_id)
        logger.info(f"Datos obtenidos: {data[:2]}")

        if not data or not isinstance(data, list) or len(data) == 0:
            return jsonify({"error": "No se pudieron obtener los datos"}), 500

        valores_filtrados = [d for d in data if str(d.get("medida_id")) == str(medida_id)]
        if not valores_filtrados:
            return jsonify({"error": f"No se encontraron datos para la medida {medida_id}"}), 404

        valor = valores_filtrados[0].get("valor")
        fecha_hora = str(valores_filtrados[0].get("time"))
        logger.info(f"Valor leído: {valor}")
        if valor is None:
            return jsonify({"error": "Dato inválido"}), 500

        if valor < limits["min"] or valor > limits["max"]:
            # Obtén el contexto de la medida (nodo, dispositivo, sensor)
            context = get_measure_context(medida_id)
            body = (
                f"¡Alerta de medida fuera de rango!\n\n"
                f"Nodo: {context['nodo']}\n"
                f"Dispositivo: {context['dispositivo']}\n"
                f"Sensor: {context['sensor']}\n"
                f"Medida: {limits['nombre_medida']}\n"
                f"Valor actual: {valor} {limits.get('unidad_medida', '')}\n"
                f"Rango permitido: {limits['min']} - {limits['max']} {limits.get('unidad_medida', '')}\n"
                f"Fecha y hora: {fecha_hora}\n"
            )
            send_email_alert(
                subject=f"⚠️ Alerta: {limits['nombre_medida']} fuera de rango",
                body=body
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