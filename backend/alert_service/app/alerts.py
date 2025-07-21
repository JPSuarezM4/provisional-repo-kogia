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


def check_limits(data, limits):
    alerts = []
    for point in data:
        value = point["value"]
        time = point["time"]
        if value < limits["min"] or value > limits["max"]:
            alerts.append((value, time))
    return alerts

def send_email_alert(subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = ALERT_RECEIVER

    with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
