import smtplib
import requests
from email.mime.text import MIMEText
from app.config import *
import logging

logger = logging.getLogger(__name__)

def get_limits(measurement_id: str):
    try:
        response = requests.get(f"{LIMITS_API_URL}/api/measures/limits/id/{measurement_id}")
        if response.status_code == 200:
            data = response.json()
            return {
                "min": data["min"],
                "max": data["max"],
                "nombre_medida": data["nombre_medida"],
                "unidad_medida": data.get("unidad_medida")
            }
        else:
            logger.error(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error al obtener límites: {e}")
    return None

def get_measure_context(medida_id):
    try:
        response = requests.get("https://sensor-service-production.up.railway.app/api/nodos")
        if response.status_code == 200:
            nodos = response.json()
            for nodo in nodos:
                for dispositivo in nodo.get("dispositivos", []):
                    for sensor in dispositivo.get("sensor", []):
                        for medida in sensor.get("medidas", []):
                            if str(medida.get("medida_id")) == str(medida_id):
                                return {
                                    "nodo": nodo.get("nombre_nodo", "Desconocido"),
                                    "dispositivo": dispositivo.get("nombre", "Desconocido"),
                                    "sensor": sensor.get("nombre", "Desconocido")
                                }
        else:
            logger.error(f"Error al obtener nodos: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error al obtener contexto de medida: {e}")
    return {"nodo": "Desconocido", "dispositivo": "Desconocido", "sensor": "Desconocido"}


def check_limits(data, limits):
    alerts = []
    for point in data:
        value = point["value"]
        time = point["time"]
        if value < limits["min"] or value > limits["max"]:
            alerts.append((value, time))
    return alerts


def get_alert_emails():
    try:
        response = requests.get("https://auth-service-production-9571.up.railway.app/api/users")
        if response.status_code == 200:
            users = response.json()
            # Filtra por rol admin o como prefieras
            return [u["email"] for u in users if u["role"] == "admin"]
    except Exception as e:
        logger.error(f"Error obteniendo correos de usuarios: {e}")
    return []

def send_email_alert(subject, body, recipients):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS

    with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        for email in recipients:
            msg["To"] = email
            server.send_message(msg)
