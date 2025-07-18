from flask import Flask, jsonify
from app.influx import read_measurements
from app.alerts import get_limits, check_limits, send_email_alert

def get_data(measurement):
    # Puedes mejorar esta función para incluir filtros, rangos de tiempo, etc.
    return read_measurements(measurement)

def create_app():
    app = Flask(__name__)

    @app.route("/check-alerts/<measurement>", methods=["GET"])
    def check_alerts(measurement):
        limits = get_limits(measurement)
        if not limits:
            return jsonify({"error": "No se pudieron obtener los límites"}), 500

        data = get_data(measurement)
        if not data:
            return jsonify({"error": "No se pudieron obtener los datos"}), 500

        alerts = check_limits(data, limits)
        if alerts:
            send_email_alert(
                subject=f"Alerta para {measurement}",
                body=f"Se detectaron valores fuera de los límites:\n\n{alerts}"
            )
            return jsonify({"message": "Alerta enviada", "alerts": alerts}), 200

        return jsonify({"message": "Todo dentro de los límites"}), 200

    return app
