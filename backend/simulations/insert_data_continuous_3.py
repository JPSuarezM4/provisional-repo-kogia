import time
import random
import math
from influxdb_client import InfluxDBClient, Point

# Configuración de InfluxDB Cloud
TOKEN = "YY2G3o8Du9uFpXeIn1SX4wSIYO32R3UArJbEgzCpyrbyE3zGGEiIdFzcVv1EvLa33TbFdsu_XENNtOhTy7W-Aw=="
ORG = "3dcfd1ba132d8ffe"
BUCKET = "KOGIA_TEST5"
URL = "https://us-east-1-1.aws.cloud2.influxdata.com"

tick = 0

with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as client:
    write_api = client.write_api()

    try:
        while True:
            tick += 1

            # NTU - sensor_id = 1
            ntu_value = round(5.0 + 2.0 * math.sin(tick / 25) + random.uniform(-0.5, 0.5), 2)
            ntu_point = Point("mediciones_dht11_v2") \
                .tag("nodo_id", "3") \
                .tag("dispositivo_id", "1") \
                .tag("sensor_id", "1") \
                .tag("medida_id", "2") \
                .field("valor", max(0, ntu_value)) \
                .time(time.time_ns())

            # Humedad - sensor_id = 4
            humedad_value = round(60.0 + 10.0 * math.sin(tick / 30) + random.uniform(-2, 2), 2)
            humedad_point = Point("mediciones_dht11_v2") \
                .tag("nodo_id", "3") \
                .tag("dispositivo_id", "1") \
                .tag("sensor_id", "4") \
                .tag("medida_id", "1") \
                .field("valor", max(0, humedad_value)) \
                .time(time.time_ns())

            # Temperatura ambiente - sensor_id = 2
            temp_value = round(25.0 + 3.0 * math.sin(tick / 20) + random.uniform(-0.5, 0.5), 2)
            temp_point = Point("mediciones_dht11_v2") \
                .tag("nodo_id", "3") \
                .tag("dispositivo_id", "1") \
                .tag("sensor_id", "2") \
                .tag("medida_id", "3") \
                .field("valor", temp_value) \
                .time(time.time_ns())

            # TDS - sensor_id = 3
            tds_value = round(300.0 + 50.0 * math.sin(tick / 15) + random.uniform(-10, 10), 2)
            tds_point = Point("mediciones_dht11_v2") \
                .tag("nodo_id", "3") \
                .tag("dispositivo_id", "1") \
                .tag("sensor_id", "3") \
                .tag("medida_id", "4") \
                .field("valor", max(0, tds_value)) \
                .time(time.time_ns())

            # Enviar a InfluxDB
            write_api.write(bucket=BUCKET, org=ORG, record=[ntu_point, humedad_point, temp_point, tds_point])

            print(f"[Sensor 1 - NTU] valor={ntu_value}")
            print(f"[Sensor 4 - Humedad] valor={humedad_value}")
            print(f"[Sensor 2 - Temperatura] valor={temp_value}")
            print(f"[Sensor 3 - TDS] valor={tds_value}")
            print("-" * 40)

            time.sleep(1)

    except KeyboardInterrupt:
        print("Proceso detenido por el usuario.")
    finally:
        write_api.close()
