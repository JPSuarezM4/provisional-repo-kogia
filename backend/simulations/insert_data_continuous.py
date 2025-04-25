import time
import random
from influxdb_client import InfluxDBClient, Point

# Configuración de InfluxDB Cloud
TOKEN = "pUIq7NPMznh5n7mCo_ibwG6Ad3lFLGXvRC1NXN_kJZaBH3gQRFL89MjWKN-TtTAEhBTce1iGO6-i2D6VEVLP3A=="
ORG = "3dcfd1ba132d8ffe"
BUCKET = "KOGIA_TEST4"
URL = "https://us-east-1-1.aws.cloud2.influxdata.com"

# Conectar a InfluxDB Cloud
with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as client:
    write_api = client.write_api()

    try:
        while True:
            dispositivo_id = 1
            sensor_id = 1
            medida_id = 1

            # Nodo 3: pH (rango entre 5.5 y 8.5)
            nodo_ph = 3
            ph_value = round(random.uniform(1, 5), 2)
            ph_point = Point("mediciones") \
                .tag("nodo_id", str(nodo_ph)) \
                .tag("dispositivo_id", str(dispositivo_id)) \
                .tag("sensor_id", str(sensor_id)) \
                .tag("medida_id", str(medida_id)) \
                .field("valor", ph_value)

            # Enviar punto a InfluxDB
            write_api.write(bucket=BUCKET, org=ORG, record=ph_point)

            print(f"[Nodo 3 - pH] valor={ph_value}")

            time.sleep(1)  

    except KeyboardInterrupt:
        print("Proceso detenido por el usuario.")
    finally:
        write_api.close()
