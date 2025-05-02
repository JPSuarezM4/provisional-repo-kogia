import time
import random
import math
from influxdb_client import InfluxDBClient, Point

# Configuración de InfluxDB Cloud
TOKEN = "pUIq7NPMznh5n7mCo_ibwG6Ad3lFLGXvRC1NXN_kJZaBH3gQRFL89MjWKN-TtTAEhBTce1iGO6-i2D6VEVLP3A=="
ORG = "3dcfd1ba132d8ffe"
BUCKET = "KOGIA_TEST4"
URL = "https://us-east-1-1.aws.cloud2.influxdata.com"

# Estado inicial de las variables
base_ph = 7.2
base_temp = 28.0
base_ntu = 5.0
base_mv = 2.0
tick = 0 

# Conectar
with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as client:
    write_api = client.write_api()

    try:
        while True:
            dispositivo_id = 1
            sensor_id = 1

            tick += 1
            ph_value = round(base_ph + 0.2 * math.sin(tick / 20) + random.uniform(-0.05, 0.05), 2)
            temp_value = round(base_temp + 1.5 * math.sin(tick / 30) + random.uniform(-0.3, 0.3), 2)
            ntu_value = round(base_ntu + 2.0 * math.sin(tick / 25) + random.uniform(-0.5, 0.5), 2)
            mv_value = round(base_mv + 0.5 * math.sin(tick / 15) + random.uniform(-0.1, 0.1), 2)

            # Nodo X: pH (medida_id = 5)
            ph_point = Point("mediciones") \
                .tag("nodo_id", "2") \
                .tag("dispositivo_id", str(dispositivo_id)) \
                .tag("sensor_id", str(sensor_id)) \
                .tag("medida_id", "6") \
                .field("valor", ph_value)

            # Nodo Y: Temperatura en Celsius (medida_id = 6)
            temp_point = Point("mediciones") \
                .tag("nodo_id", "3") \
                .tag("dispositivo_id", str(dispositivo_id)) \
                .tag("sensor_id", str(sensor_id)) \
                .tag("medida_id", "5") \
                .field("valor", temp_value)

            # Nodo Z: NTU/Turbidez (medida_id = 8)
            ntu_point = Point("mediciones") \
                .tag("nodo_id", "4") \
                .tag("dispositivo_id", str(dispositivo_id)) \
                .tag("sensor_id", str(sensor_id)) \
                .tag("medida_id", "8") \
                .field("valor", max(0, ntu_value))  # evita valores negativos

            # Nodo W: mV (medida_id = 7)

            mv_point = Point("mediciones") \
                .tag("nodo_id", "5") \
                .tag("dispositivo_id", str(dispositivo_id)) \
                .tag("sensor_id", str(sensor_id)) \
                .tag("medida_id", "7") \
                .field("valor", mv_value)

            # Enviar a InfluxDB
            write_api.write(bucket=BUCKET, org=ORG, record=[ph_point, temp_point, ntu_point, mv_point])

            print(f"[Nodo 2 - pH] valor={ph_value}")
            print(f"[Nodo 3 - Temp] valor={temp_value}")
            print(f"[Nodo 4 - NTU] valor={ntu_value}")
            print(f"[Nodo 5 - mV] valor={mv_value}")

            time.sleep(1)

    except KeyboardInterrupt:
        print("Proceso detenido por el usuario.")
    finally:
        write_api.close()