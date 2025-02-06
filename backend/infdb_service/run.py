from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from config.settings import Config
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.exceptions import InfluxDBError
from datetime import datetime, timezone

app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS correctamente
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"], "allow_headers": ["Content-Type", "Authorization"], "expose_headers": ["Content-Range", "X-Content-Range"]}}, supports_credentials=True)

sensor_service_url = "http://localhost:5000/api/nodos"    

# Configuración de InfluxDB
INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com" 
INFLUX_TOKEN = "mmCDp_td18-04SKCy0hUT87gccu-hl52YL0SU0Dl-f_G-tSHrVv1S2KzEzQwIlnozYmpqhvrpDi16Uxxu4vCTQ=="
INFLUX_ORG = "3dcfd1ba132d8ffe"
INFLUX_BUCKET = "KOGIA_TEST_1"
client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)

@app.route("/migrar", methods=["GET"])
def migrar_datos():
    """
    Migrar datos desde el microservicio A a InfluxDB.
    """
    try:
        # Obtener los datos del microservicio A
        response = requests.get(sensor_service_url, timeout=10)
        if response.status_code != 200:
            return jsonify({"error": "No se pudieron obtener los datos"}), 500

        data = response.json()
        write_api = client.write_api()

        for nodo in data:
            nodo_id = nodo["nodo_id"]
            for dispositivo in nodo["dispositivos"]:
                dispositivo_id = dispositivo["dispositivo_id"]
                for sensor in dispositivo["sensor"]:
                    sensor_id = sensor["sensor_id"]
                    for medida in sensor["medidas"]:
                        medida_id = medida["medida_id"]
                        fecha_creacion = medida["fecha_creacion"]
                        
                        timestamp = int(datetime.fromisoformat(fecha_creacion).replace(tzinfo=timezone.utc).timestamp() * 1e9)
    
                        print(f"Fecha original: {fecha_creacion}, Timestamp: {timestamp}")  # Depuración

                        punto = (
                            Point("mediciones_test_1")
                            .tag("nodo_id", nodo_id)
                            .tag("dispositivo_id", dispositivo_id)
                            .tag("sensor_id", sensor_id)
                            .tag("medida_id", medida_id)
                            .tag("unidad", medida["unidad"])  # ✅ Ahora "unidad" es un tag
                            .field("valor", float(medida["valor"]))  # ✅ Solo los valores numéricos quedan en `_value`
                            .field("fecha_creacion", fecha_creacion)
                            .time(timestamp, write_precision="ns")  # ✅ Guardar el tiempo correctamente
                        )

                        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=punto)


        return jsonify({"message": "Datos migrados a InfluxDB"}), 201
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error en la solicitud: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
    
@app.route("/get_data", methods=["GET"])
def get_data():
    try:
        # Obtener y validar parámetros de la solicitud
        nodo_id = request.args.get("nodo_id")
        dispositivo_id = request.args.get("dispositivo_id")
        sensor_id = request.args.get("sensor_id")
        medida_id = request.args.get("medida_id")
        rango = request.args.get("rango", "-1w")  # Rango de tiempo por defecto: última semana
        measurement = request.args.get("measurement", "mediciones_test_1")  # Nuevo parámetro para el measurement con valor por defecto

        if not all([nodo_id, dispositivo_id, sensor_id, medida_id]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        # Construir la consulta Flux de manera segura
        query = f'''
        from(bucket: "{INFLUX_BUCKET}")
          |> range(start: {rango})
          |> filter(fn: (r) => 
              r["_measurement"] == "{measurement}" and
              r["nodo_id"] == "{nodo_id}" and 
              r["dispositivo_id"] == "{dispositivo_id}" and 
              r["sensor_id"] == "{sensor_id}" and 
              r["medida_id"] == "{medida_id}"
          )
          |> filter(fn: (r) => r["_field"] == "valor")  // ✅ Filtra solo valores numéricos
          |> keep(columns: ["_time", "_value", "unidad", "fecha_creacion"])  // ✅ Mantiene unidad y fecha_creacion
        '''

        # Ejecutar la consulta
        query_api = client.query_api()
        result = query_api.query(query)

        # Procesar los resultados
        data = []
        for table in result:
            for record in table.records:
                try:
                    value = float(record.get_value())  # Intentar convertir a número
                except ValueError:
                    continue  # Omitir valores que no sean numéricos

                # Obtener unidad y fecha_creacion de los tags
                unidad = record.values.get("unidad")  # Si no existe, devolver "N/A"
                fecha_creacion = record.values.get("fecha_creacion", record.get_time().isoformat())  # Usar _time si no existe

                data.append({
                    "time": record.get_time().isoformat(),  # ✅ Fecha registrada por InfluxDB
                    "fecha_creacion": fecha_creacion,  # ✅ Nueva fecha obtenida
                    "valor": value,
                    "unidad": unidad  # ✅ Nueva unidad agregada
                })

        return jsonify(data), 200

    except InfluxDBError as e:
        # Manejar errores específicos de InfluxDB
        return jsonify({"error": f"Error en la consulta a InfluxDB: {str(e)}"}), 500

    except Exception as e:
        # Manejar otros errores inesperados
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
    

@app.route("/get_all_data", methods=["GET"])
def get_all_data():
    try:
        # Obtener y validar parámetros de la solicitud
        nodo_id = request.args.get("nodo_id")
        dispositivo_id = request.args.get("dispositivo_id")
        sensor_id = request.args.get("sensor_id")
        rango = request.args.get("rango", "-1w")  # Rango de tiempo por defecto: última semana
        measurement = request.args.get("measurement", "mediciones_test_1")  # Nuevo parámetro para el measurement con valor por defecto

        if not all([nodo_id, dispositivo_id, sensor_id]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        # Construir la consulta Flux de manera segura
        query = f'''
        from(bucket: "{INFLUX_BUCKET}")
            |> range(start: {rango})
            |> filter(fn: (r) => 
                r["_measurement"] == "{measurement}" and
                r["nodo_id"] == "{nodo_id}" and 
                r["dispositivo_id"] == "{dispositivo_id}" and 
                r["sensor_id"] == "{sensor_id}"
            )
            |> filter(fn: (r) => r["_field"] == "valor")  // ✅ Filtra solo valores numéricos
            |> keep(columns: ["_time", "_value", "unidad", "fecha_creacion", "medida_id"])  // ✅ Mantiene unidad, fecha_creacion y medida_id
        '''

        # Ejecutar la consulta
        query_api = client.query_api()
        result = query_api.query(query)

        # Procesar los resultados
        data = []
        for table in result:
            for record in table.records:
                try:
                    value = float(record.get_value())  # Intentar convertir a número
                except ValueError:
                    continue  # Omitir valores que no sean numéricos

                # Obtener unidad, fecha_creacion y medida_id de los tags
                unidad = record.values.get("unidad")  # Si no existe, devolver "N/A"
                fecha_creacion = record.values.get("fecha_creacion", record.get_time().isoformat())  # Usar _time si no existe
                medida_id = record.values.get("medida_id")

                data.append({
                    "time": record.get_time().isoformat(),  # ✅ Fecha registrada por InfluxDB
                    "fecha_creacion": fecha_creacion,  # ✅ Nueva fecha obtenida
                    "valor": value,
                    "unidad": unidad,  # ✅ Nueva unidad agregada
                    "medida_id": medida_id  # ✅ Nueva medida_id agregada
                })

        return jsonify(data), 200

    except InfluxDBError as e:
        # Manejar errores específicos de InfluxDB
        return jsonify({"error": f"Error en la consulta a InfluxDB: {str(e)}"}), 500

    except Exception as e:
        # Manejar otros errores inesperados
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
    
    
@app.route("/get_filters", methods=["GET"])
def get_filters():
    try:
        query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: -30d)
        |> keep(columns: ["nodo_id", "dispositivo_id", "sensor_id"])
        |> distinct(column: "sensor_id")
        '''

        query_api = client.query_api()
        result = query_api.query(query)

        filters = {}
        for table in result:
            for record in table.records:
                nodo = record["nodo_id"]
                dispositivo = record["dispositivo_id"]
                sensor = record["sensor_id"]

                if nodo not in filters:
                    filters[nodo] = {}

                if dispositivo not in filters[nodo]:
                    filters[nodo][dispositivo] = []

                if sensor not in filters[nodo][dispositivo]:
                    filters[nodo][dispositivo].append(sensor)

        return jsonify(filters)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5050, debug=True)
