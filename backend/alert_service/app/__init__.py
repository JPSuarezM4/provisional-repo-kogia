from flask import Flask, jsonify
from app.influx import read_measurements
from app.alerts import get_limits, check_limits, send_email_alert

def get_data(measurement_name):
    # Aquí podrías agregar filtros de tiempo si lo necesitas.
    return read_measurements(measurement_name)

def create_app():
    app = Flask(__name__)

    @app.route("/check-alerts/<int:medida_id>", methods=["GET"])
    def check_alerts(medida_id):
        limits = get_limits(medida_id)
        if not limits:
            return jsonify({"error": "No se pudieron obtener los límites"}), 500

        # Obtener el nombre del measurement
        measurement_name = limits.get("nombre_medida")
        if not measurement_name:
            return jsonify({"error": "nombre_medida no está presente en los límites"}), 500
        data = get_data(measurement_name)

        if not data or not isinstance(data, list) or len(data) == 0:
            return jsonify({"error": "No se pudieron obtener los datos"}), 500

        # Suponiendo que el último dato tiene clave 'valor'
        valor = data[0].get("valor")
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
