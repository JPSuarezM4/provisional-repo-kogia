from influxdb_client import InfluxDBClient, Point, WritePrecision

# Configuración de InfluxDB Cloud
TOKEN = "XYLpgorf1yuxC9piOTqvc_zFm9BpEICOv6un799P9dij5Xgc6IrIF66aM8kHpyoXrakry94G6Zty3n-v6es4jg=="
ORG = "3dcfd1ba132d8ffe"
BUCKET = "KOGIA_TEST2"
URL = "https://us-east-1-1.aws.cloud2.influxdata.com"

# Conectar a InfluxDB Cloud usando 'with'
with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as client:
    write_api = client.write_api()
    
    # Datos a insertar (IDs y valor)
    datos = [
        {"nodo_id": 1, "dispositivo_id": 1, "sensor_id": 1, "medida_id": 1, "valor": 21.6},
    ]

    # Insertar datos en InfluxDB Cloud
    for dato in datos:
        point = Point("mediciones") \
            .tag("nodo_id", str(dato["nodo_id"])) \
            .tag("dispositivo_id", str(dato["dispositivo_id"])) \
            .tag("sensor_id", str(dato["sensor_id"])) \
            .tag("medida_id", str(dato["medida_id"])) \
            .field("valor", dato["valor"]) 
        
        write_api.write(bucket=BUCKET, org=ORG, record=point)
        print(f"Dato insertado: {dato}")

    # Cerrar correctamente la API de escritura
    write_api.close()
    print("Datos insertados correctamente")