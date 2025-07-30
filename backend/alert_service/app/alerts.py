import smtplib
import requests
from email.mime.text import MIMEText
from app.config import *
import logging


AUTH_URL = "https://auth-service-production-9571.up.railway.app/api/login"
USERS_URL = "https://auth-service-production-9571.up.railway.app/api/users"
SERVICE_EMAIL = "alert_service@alert.com"
SERVICE_PASSWORD = "alert_service_password"

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


def get_jwt_token():
    logger.info(f"Intentando obtener token JWT para usuario: {SERVICE_EMAIL}")
    try:
        response = requests.post(AUTH_URL, json={
            "email": SERVICE_EMAIL,
            "password": SERVICE_PASSWORD
        })
        logger.info(f"Respuesta del endpoint de login: {response.status_code} - {response.text}")
        if response.status_code == 200:
            token = response.json().get("access_token")
            if token:
                logger.info("Token JWT obtenido correctamente.")
            else:
                logger.error("No se encontró 'access_token' en la respuesta.")
            return token
        else:
            logger.error(f"Error al obtener token JWT: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Excepción al obtener token JWT: {e}")
    return None

def get_alert_emails():
    token = get_jwt_token()
    if not token:
        logger.error("No se pudo obtener el token JWT para consultar usuarios.")
        return []
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(USERS_URL, headers=headers)
        if response.status_code == 200:
            users = response.json()
            return [u["email"] for u in users if u["role"] == "admin"]
        else:
            logger.error(f"Error: {response.status_code} - {response.text}")
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
