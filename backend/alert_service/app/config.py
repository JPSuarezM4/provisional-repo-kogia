import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 465
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
LIMITS_API_URL = os.getenv("LIMITS_API_URL")
ALERT_RECEIVER = os.getenv("ALERT_RECEIVER")  # correo destino
