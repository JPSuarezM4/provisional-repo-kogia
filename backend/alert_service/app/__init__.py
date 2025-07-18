from flask import Flask, jsonify
from app.influx import read_measurements
from app.alerts import get_limits, check_limits, send_email_alert

def create_app():
    app = Flask(__name__)

    @app.route("/check-alerts/<measurement>")
    def check_alerts(measurement):
        data = read_measurements(measurement)
        limits = get_limits(measurement)
        if not limits:
            return jsonify({"error": "No se pudieron obtener los límites"}), 500

        alert_data = check_limits(data, limits)
        if alert_data:
            message = "\n".join([f"Valor: {val} - Hora: {ts}" for val, ts in alert_data])
            send_email_alert(f"⚠️ Alerta: {measurement} fuera de rango", message)
            return jsonify({"alertas_enviadas": alert_data}), 200
        return jsonify({"status": "Todo dentro de límites"}), 200

    return app
