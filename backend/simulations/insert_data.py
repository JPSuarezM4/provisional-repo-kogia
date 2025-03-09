from influxdb_client import InfluxDBClient, Point

# Configuración de InfluxDB Cloud
TOKEN = "pUIq7NPMznh5n7mCo_ibwG6Ad3lFLGXvRC1NXN_kJZaBH3gQRFL89MjWKN-TtTAEhBTce1iGO6-i2D6VEVLP3A=="
ORG = "3dcfd1ba132d8ffe"
BUCKET = "KOGIA_TEST4"
URL = "https://us-east-1-1.aws.cloud2.influxdata.com"

# Conectar a InfluxDB Cloud usando 'with'
with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as client:
    write_api = client.write_api()  
    # Datos a insertar (IDs y valor)
    datos = [
        {"nodo_id": 2, "dispositivo_id": 1, "sensor_id": 1, "medida_id": 1, "valor": 30.1},
        {"nodo_id": 3, "dispositivo_id": 1, "sensor_id": 1, "medida_id": 1, "valor": 29.3},

    ]

    # Insertar datos en InfluxDB Cloud
    for dato in datos:
        point = Point("mediciones") \
            .tag("nodo_id", str(dato["nodo_id"])) \
            .tag("dispositivo_id", str(dato["dispositivo_id"])) \
            .tag("sensor_id", str(dato["sensor_id"])) \
            .tag("medida_id", str(dato["medida_id"])) \
            .field("valor", float(dato["valor"]))  # Convertir a flotante
        write_api.write(bucket=BUCKET, org=ORG, record=point)
        print(f"Dato insertado: {dato}")

    # Cerrar correctamente la API de escritura
    write_api.close()
    print("Datos insertados correctamente")