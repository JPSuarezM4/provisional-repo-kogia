import os
from dotenv import load_dotenv

load_dotenv()

class Config:
   # SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
   # SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY")
    
    
# print(os.getenv("DATABASE_URL"))  # Debería imprimir la cadena de conexión
print(os.getenv("SECRET_KEY"))  # Debería imprimir "secretkeytest"