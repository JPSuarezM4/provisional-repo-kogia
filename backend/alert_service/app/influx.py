from influxdb_client import InfluxDBClient
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("INFLUX_URL")
token = os.getenv("INFLUX_TOKEN")
org = os.getenv("INFLUX_ORG")
bucket = os.getenv("INFLUX_BUCKET")

client = InfluxDBClient(url=url, token=token, org=org)
query_api = client.query_api()

def read_measurements(measurement_id: int):
    query = f'''
        from(bucket: "{bucket}")
          |> range(start: -5m)
          |> filter(fn: (r) => r["_measurement"] == "mediciones_dht11_v2")
          |> filter(fn: (r) => r["medida_id"] == "{measurement_id}")
          |> filter(fn: (r) => r["_field"] == "valor")
    '''
    result = query_api.query(org=org, query=query)

    values = []
    for table in result:
        for record in table.records:
            # Incluye medida_id en el diccionario
            values.append({
                "time": record.get_time(),
                "value": record.get_value(),
                "medida_id": record.values.get("medida_id")  # <-- agrega esto
            })
    return values
