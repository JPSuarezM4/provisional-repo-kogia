from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.exceptions import InfluxDBError
from influxdb_client.client.write_api import SYNCHRONOUS
import requests
import time
import os
import json
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": ["https://kogia-orcin.vercel.app/", "https://kogia-qa.up.railway.app"], "allow_headers": ["Content-Type", "Authorization"], "expose_headers": ["Content-Range", "X-Content-Range"]}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins=["https://kogia-orcin.vercel.app/", "https://kogia-qa.up.railway.app"])

# Configuración de InfluxDB
INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com"
INFLUX_TOKEN = "YY2G3o8Du9uFpXeIn1SX4wSIYO32R3UArJbEgzCpyrbyE3zGGEiIdFzcVv1EvLa33TbFdsu_XENNtOhTy7W-Aw=="
INFLUX_ORG = "3dcfd1ba132d8ffe"
INFLUX_BUCKET = "KOGIA_TEST5"
client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)
query_api = client.query_api()

# URL del microservicio sensor_service
SENSOR_SERVICE_URL = "https://sensor-service-production.up.railway.app"


# Función para enviar datos en tiempo real desde el microservicio
def send_real_time_data():
    while True:
        try:
            # Obtener datos del microservicio sensor_service
            response = requests.get(SENSOR_SERVICE_URL, timeout=10)
            if response.status_code != 200:
                print("Error al obtener datos del microservicio sensor_service")
                time.sleep(1)
                continue

            data = response.json()

            # Procesar y enviar los datos a través del WebSocket
            for nodo in data:
                nodo_id = nodo["nodo_id"]
                for dispositivo in nodo["dispositivos"]:
                    dispositivo_id = dispositivo["dispositivo_id"]
                    for sensor in dispositivo["sensor"]:
                        sensor_id = sensor["sensor_id"]
                        for medida in sensor["medidas"]:
                            medida_id = medida["medida_id"]
                            valor = medida["valor"]

                            data_point = {
                                "nodo_id": nodo_id,
                                "dispositivo_id": dispositivo_id,
                                "sensor_id": sensor_id,
                                "medida_id": medida_id,
                                "valor": valor,
                                "time": time.time() * 1000  # Marca de tiempo en milisegundos
                            }

                            # Enviar el dato al cliente a través del WebSocket
                            socketio.emit("realtime_data", data_point)

            time.sleep(1)  # Esperar 1 segundo antes de la siguiente solicitud
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener datos del microservicio: {e}")
            time.sleep(1)
        except Exception as e:
            print(f"Error inesperado: {e}")
            time.sleep(1)

# Evento de conexión al WebSocket
# Enviar datos en tiempo real
@socketio.on('connect')
def handle_connect():
    print("Cliente conectado")
    socketio.start_background_task(send_real_time_data_to)

def send_real_time_data_to():
    while True:
        try:
            query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1m)'
            result = query_api.query(org=INFLUX_ORG, query=query)
            
            data = []
            for table in result:
                for record in table.records:
                    # Solo enviar los puntos con el campo "valor"
                    if record.get_field() == "valor":
                        data.append({
                            "nodo_id": record.values.get("nodo_id"),
                            "dispositivo_id": record.values.get("dispositivo_id"),
                            "sensor_id": record.values.get("sensor_id"),
                            "medida_id": record.values.get("medida_id"),
                            "valor": float(record.get_value()),
                            "time": record.get_time().isoformat()
                        })
            socketio.emit('real_time_data', json.dumps(data))
        except Exception as e:
            print(f"Error obteniendo datos en tiempo real: {e}")
        socketio.sleep(1)
        
@socketio.on("message")
def handle_message(message):
    # print(f"Mensaje recibido: {message}")
    socketio.send({"msg": f"Echo: {message}"}) 

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Servidor WebSocket en ejecución"}), 200

@app.route("/migrar", methods=["GET"])
def migrar_datos():
    """
    Migrar datos desde el microservicio A a InfluxDB.
    """
    try:
        # Obtener los datos del microservicio A
        response = requests.get(SENSOR_SERVICE_URL, timeout=10)
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

                        punto = (
                            Point("mediciones_test_1")
                            .tag("nodo_id", nodo_id)
                            .tag("dispositivo_id", dispositivo_id)
                            .tag("sensor_id", sensor_id)
                            .tag("medida_id", medida_id)
                            .field("valor", float(medida["valor"]))  # ✅ Solo los valores numéricos quedan en `_value`
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
        nodo_id = request.args.get("nodo_id")
        dispositivo_id = request.args.get("dispositivo_id")
        sensor_id = request.args.get("sensor_id")
        medida_id = request.args.get("medida_id")
        rango = request.args.get("rango", "-1w")
        measurement = request.args.get("measurement", "mediciones")

        if not all([nodo_id, dispositivo_id, sensor_id, medida_id]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        # No filtramos por _field == "valor", traemos todos los campos
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
          |> keep(columns: ["_time", "_field", "_value"])
        '''

        query_api = client.query_api()
        result = query_api.query(query)

        data = []
        for table in result:
            for record in table.records:
                try:
                    value = float(record.get_value())
                except ValueError:
                    continue

                data.append({
                    "time": record.get_time().isoformat(),
                    "campo": record.get_field(),  # Nombre del campo, ej: Humedad_del_aire
                    "valor": value,
                })

        return jsonify(data), 200

    except InfluxDBError as e:
        return jsonify({"error": f"Error en la consulta a InfluxDB: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
    

@app.route("/get_all_data", methods=["GET"])
def get_all_data():
    try:
        # Obtener parámetros
        nodo_id = request.args.get("nodo_id")
        dispositivo_id = request.args.get("dispositivo_id")
        sensor_id = request.args.get("sensor_id")
        rango = request.args.get("rango", "-1w")  # Rango por defecto
        measurement = request.args.get("measurement", "mediciones_dht11_v2")  # Parámetro opcional

        if not all([nodo_id, dispositivo_id, sensor_id]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        # Interpretar rango de tiempo
        def parse_rango(rango_str):
            try:
                now = datetime.utcnow()
                if rango_str.endswith('d'):
                    days = int(rango_str.strip('-d'))
                    return now - timedelta(days=days)
                elif rango_str.endswith('h'):
                    hours = int(rango_str.strip('-h'))
                    return now - timedelta(hours=hours)
                elif rango_str.endswith('w'):
                    weeks = int(rango_str.strip('-w'))
                    return now - timedelta(weeks=weeks)
                elif rango_str.endswith('m'):
                    minutes = int(rango_str.strip('-m'))
                    return now - timedelta(minutes=minutes)
                else:
                    raise ValueError("Formato de rango inválido")
            except Exception as e:
                raise ValueError(f"Error al interpretar el rango: {e}")

        start_time = parse_rango(rango).isoformat() + 'Z'
        end_time = datetime.utcnow().isoformat() + 'Z'



        query = f'''
        from(bucket: "{INFLUX_BUCKET}")
        |> range(start: time(v: "{start_time}"), stop: time(v: "{end_time}"))
        |> filter(fn: (r) => 
            r["_measurement"] == "{measurement}" and
            r["nodo_id"] == "{nodo_id}" and
            r["dispositivo_id"] == "{dispositivo_id}" and
            r["sensor_id"] == "{sensor_id}"
        )
        |> filter(fn: (r) => r["_field"] == "valor")
        |> keep(columns: ["_time", "_value", "medida_id"])
        '''

        # Ejecutar consulta
        query_api = client.query_api()
        result = query_api.query(query)

        # Procesar resultados
        data = []
        for table in result:
            for record in table.records:
                try:
                    value = float(record.get_value())
                except ValueError:
                    continue

                data.append({
                    "time": record.get_time().isoformat(),
                    "valor": value,
                    "medida_id": record.values.get("medida_id")
                })

        return jsonify(data), 200

    except InfluxDBError as e:
        return jsonify({"error": f"Error en la consulta a InfluxDB: {str(e)}"}), 500
    except Exception as e:
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
    

@app.route("/insert_data", methods=["POST"])
def insert_data():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400

        write_api = client.write_api()
        for item in data:
            nodo_id = item.get("nodo_id")
            dispositivo_id = item.get("dispositivo_id")
            sensor_id = item.get("sensor_id")
            medida_id = item.get("medida_id")
            valor = item.get("valor")

            if not all([nodo_id, dispositivo_id, sensor_id, medida_id, valor]):
                continue

            punto = (
                Point("mediciones_test_1")
                .tag("nodo_id", nodo_id)
                .tag("dispositivo_id", dispositivo_id)
                .tag("sensor_id", sensor_id)
                .tag("medida_id", medida_id)
                .field("valor", float(valor))
                
            )

            write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=punto)

        return jsonify({"message": "Datos insertados correctamente"}), 201

    except InfluxDBError as e:
        return jsonify({"error": f"Error en la escritura a InfluxDB: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500
    
port = int(os.environ.get("PORT", 5000))

if __name__ == "__main__":

    socketio.run(app, host="0.0.0.0", port=port, debug=False)
