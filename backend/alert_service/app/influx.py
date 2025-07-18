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

def read_measurements(measurement: str):
    query = f'''
        from(bucket: "{bucket}")
          |> range(start: -5m)
          |> filter(fn: (r) => r["_measurement"] == "{measurement}")
          |> filter(fn: (r) => r["_field"] == "value")
    '''
    result = query_api.query(org=org, query=query)

    values = []
    for table in result:
        for record in table.records:
            values.append({"time": record.get_time(), "value": record.get_value()})
    return values
