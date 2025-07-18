import smtplib
import requests
from email.mime.text import MIMEText
from app.config import *

def get_limits(measurement: str):
    try:
        response = requests.get(f"{LIMITS_API_URL}/limits/{measurement}")
        if response.status_code == 200:
            data = response.json()
            return {"min": data["min"], "max": data["max"]}
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error al obtener límites: {e}")
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
