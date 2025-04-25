from flask import Blueprint, request, jsonify
from database.models import db, NodoData
from database.schema import NodoDataSchema
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import or_
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from uuid import uuid4

nodo_bp = Blueprint('nodos', __name__)
nodo_schema = NodoDataSchema()


def convert_datetime_to_isoformat(data):
    if isinstance(data, list):
        for item in data:
            convert_datetime_to_isoformat(item)
    elif isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, (list, dict)):
                convert_datetime_to_isoformat(value)

# Crear un nuevo nodo
@nodo_bp.route('/nodos', methods=['POST'])
def create_nodo():
    """
    Crear un nuevo nodo.
    """
    data = request.get_json()
    try:
        # Validar el nodo con el esquema
        validated_nodo = nodo_schema.load(data)

        # Crear un nuevo nodo con todos los datos
        new_nodo = NodoData(
            suscriptor_id=validated_nodo['suscriptor_id'],
            dispositivos=validated_nodo['dispositivos'],  # Guardamos sensores como JSON
            nombre_nodo=validated_nodo['nombre_nodo'],
            descripcion_nodo=validated_nodo['descripcion_nodo'],
            longitud=validated_nodo['longitud'],
            latitud=validated_nodo['latitud']
        )
        db.session.add(new_nodo)
        db.session.commit()

        return jsonify({"message": "Nodo creado correctamente", "nodo": new_nodo.to_dict()}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

 
# Agregar un sensor a un nodo existente
@nodo_bp.route('/nodos/<int:nodo_id>/sensor', methods=['POST'])
def add_sensor_to_nodo(nodo_id):
    data = request.get_json()
    
    try:
        # Convertir datetime a ISO 8601 en el JSON recibido
        convert_datetime_to_isoformat(data)

        # Validar el sensor recibido
        sensor_data = data.get('sensor')
        if not sensor_data:
            return jsonify({"error": "Se debe proporcionar un sensor"}), 400
        
        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404
        
        # Agregar el sensor al campo 'sensores' (si ya existe)
        if nodo.sensor is None:
            nodo.sensor = []

        # Verificar que el sensor no exista ya en la lista (opcional)
        existing_sensor_ids = [sensor['sensor_id'] for sensor in nodo.sensor]
        if sensor_data['sensor_id'] in existing_sensor_ids:
            return jsonify({"error": "El sensor ya está agregado a este nodo"}), 400

        # Añadir el nuevo sensor
        nodo.sensor.append(sensor_data)

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Sensor agregado correctamente", "nodo": nodo.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    except ValueError as e:
        return jsonify({"error": str(e)}), 400


# Obtener todos los nodos
@nodo_bp.route('/nodos', methods=['GET'])
def get_nodos():
    nodos = NodoData.query.all()
    return jsonify(nodo_schema.dump(nodos, many=True)), 200


# Obtener un nodo específico por ID
@nodo_bp.route('/nodos/<int:nodo_id>', methods=['GET'])
def get_nodo_by_id(nodo_id):
    nodo = NodoData.query.filter_by(nodo_id=nodo_id).first()
    if not nodo:
        return jsonify({"error": "Nodo no encontrado"}), 404
    return jsonify(nodo_schema.dump(nodo)), 200

#Crear un nuevo dispositivo
@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos', methods=['PUT'])
def update_dispositivos(nodo_id):
    data = request.get_json()

    try:
        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404

        # Obtener los dispositivos actuales (asegurando que sea una lista)
        dispositivos = nodo.dispositivos or []

        # Obtener el máximo ID actual de los dispositivos existentes
        max_dispositivo_id = max(
            [int(d['dispositivo_id']) for d in dispositivos if str(d.get('dispositivo_id')).isdigit()],
            default=0
        )

        # Agregar los nuevos dispositivos asegurando incrementos de 1 en 1
        nuevos_dispositivos = []
        for dispositivo in data.get('dispositivos', []):
            if not str(dispositivo.get('dispositivo_id')).isdigit():  # Verifica si el ID es válido
                max_dispositivo_id += 1  # Incrementar en 1
                dispositivo['dispositivo_id'] = max_dispositivo_id
            
            nuevos_dispositivos.append(dispositivo)

        # Actualizar la lista de dispositivos
        nodo.dispositivos.extend(nuevos_dispositivos)

        # Marcar la columna dispositivos como modificada
        flag_modified(nodo, "dispositivos")

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Dispositivos actualizados correctamente", "nodo": nodo.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error en la base de datos: " + str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Error inesperado: " + str(e)}), 400



# Obtener los sensores de un nodo
@nodo_bp.route('/nodos/<int:nodo_id>/sensores', methods=['GET'])
def get_sensores_by_nodo(nodo_id):
    """
    Obtener los sensores de un nodo específico por ID.
    """
    nodo = NodoData.query.filter_by(nodo_id=nodo_id).first()
    if not nodo:
        return jsonify({"error": "Nodo no encontrado"}), 404

    return jsonify({"sensores": nodo.dispositivos}), 200


#Crear medidas para un sensor
@nodo_bp.route(
    '/nodos/<int:nodo_id>/dispositivos/<int:dispositivo_id>/sensor/<int:sensor_id>/medidas', 
    methods=['PUT']
)
def add_medidas_to_sensor(nodo_id, dispositivo_id, sensor_id):
    """
    Agregar medidas a un sensor específico dentro de un dispositivo en un nodo.
    """
    data = request.get_json()

    try:
        # Convertir datetime a ISO 8601 en el JSON recibido
        convert_datetime_to_isoformat(data)

        # Validar las medidas recibidas
        medidas = data.get('medidas', [])
        if not medidas or not isinstance(medidas, list):
            return jsonify({"error": "Se deben proporcionar medidas en formato de lista"}), 400

        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404

        # Buscar el dispositivo dentro del nodo
        dispositivo = next(
            (d for d in nodo.dispositivos if d['dispositivo_id'] == dispositivo_id), 
            None
        )
        if not dispositivo:
            return jsonify({"error": "Dispositivo no encontrado"}), 404

        # Buscar el sensor dentro del dispositivo
        sensor = next(
            (s for s in dispositivo.get('sensor', []) if s['sensor_id'] == sensor_id), 
            None
        )
        if not sensor:
            return jsonify({"error": "Sensor no encontrado"}), 404

        # Asegurar que la lista de medidas exista
        if 'medidas' not in sensor:
            sensor['medidas'] = []

        # Obtener el `medida_id` máximo actual
        max_medida_id = max(
            [int(m.get('medida_id', 0)) for m in sensor['medidas'] if str(m.get('medida_id')).isdigit()],
            default=0
        )

        # Agregar nuevas medidas con IDs autoincrementales
        for medida in medidas:
            if not isinstance(medida, dict) or 'unidad' not in medida:
                return jsonify({"error": "Cada medida debe tener una 'unidad'"}), 400

            # Evitar duplicados por unidad
            if any(m.get('unidad') == medida['unidad'] for m in sensor['medidas']):
                continue  # o return jsonify({"error": f"Unidad {medida['unidad']} ya existe"}), 400

            max_medida_id += 1
            medida['medida_id'] = max_medida_id
            sensor['medidas'].append(medida)

        # Marcar la columna dispositivos como modificada
        flag_modified(nodo, "dispositivos")

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Medidas agregadas correctamente", "sensor": sensor}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500

    except ValueError as e:
        return jsonify({"error": f"Error de valor: {str(e)}"}), 400

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 400



# Obtener una medida específica de un sensor
@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos/<int:dispositivo_id>/sensor/<int:sensor_id>/medidas/<int:medida_id>', methods=['GET'])
def get_medida_by_id(nodo_id, dispositivo_id, sensor_id, medida_id):
    """
    Obtener una medida específica de un sensor dentro de un dispositivo en un nodo.
    """
    try:
        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404

        # Buscar el dispositivo dentro del nodo
        dispositivo = next((d for d in nodo.dispositivos if d['dispositivo_id'] == dispositivo_id), None)
        if not dispositivo:
            return jsonify({"error": "Dispositivo no encontrado"}), 404

        # Buscar el sensor dentro del dispositivo
        sensor = next((s for s in dispositivo.get('sensor', []) if s['sensor_id'] == sensor_id), None)
        if not sensor:
            return jsonify({"error": "Sensor no encontrado"}), 404

        # Buscar la medida dentro del sensor
        medida = next((m for m in sensor.get('medidas', []) if m['medida_id'] == medida_id), None)
        if not medida:
            return jsonify({"error": "Medida no encontrada"}), 404

        return jsonify({"medida": medida}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

# Obtener las medidas de un sensor específico
@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos/<int:dispositivo_id>/sensor/<int:sensor_id>/medidas', methods=['GET'])
def get_medidas_by_sensor(nodo_id, dispositivo_id, sensor_id):
    """
    Obtener las medidas de un sensor específico dentro de un dispositivo en un nodo.
    """
    try:
        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404

        # Buscar el dispositivo dentro del nodo
        dispositivo = next((d for d in nodo.dispositivos if d['dispositivo_id'] == dispositivo_id), None)
        if not dispositivo:
            return jsonify({"error": "Dispositivo no encontrado"}), 404

        # Buscar el sensor dentro del dispositivo
        sensor = next((s for s in dispositivo.get('sensor', []) if s['sensor_id'] == sensor_id), None)
        if not sensor:
            return jsonify({"error": "Sensor no encontrado"}), 404

        # Obtener las medidas del sensor
        medidas = sensor.get('medidas', [])
        if not medidas:
            return jsonify({"message": "No se encontraron medidas para este sensor"}), 200

        return jsonify({"medidas": medidas}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Eliminar un nodo por ID
@nodo_bp.route('/nodos/<int:nodo_id>', methods=['DELETE'])
def delete_nodo(nodo_id):
    try:
        nodo = NodoData.query.filter_by(nodo_id=nodo_id).first()
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404

        db.session.delete(nodo)
        db.session.commit()

        return jsonify({"message": "Nodo eliminado correctamente"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Agregar múltiples sensores a un dispositivo específico en un nodo
@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos/<int:dispositivo_id>/sensor', methods=['PUT'])
def add_sensors_to_dispositivo(nodo_id, dispositivo_id):
    data = request.get_json()

    try:
        # Convertir datetime a ISO 8601 en el JSON recibido
        convert_datetime_to_isoformat(data)

        # Validar los sensores recibidos
        sensors_data = data.get('sensors', [])
        if not sensors_data or not isinstance(sensors_data, list):
            return jsonify({"error": "Se debe proporcionar una lista de sensores"}), 400

        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404

        # Buscar el dispositivo dentro del JSON
        dispositivo = next((d for d in nodo.dispositivos if d['dispositivo_id'] == dispositivo_id), None)
        if not dispositivo:
            return jsonify({"error": "Dispositivo no encontrado"}), 404

        # Asegurar que el dispositivo tenga una lista de sensores
        if 'sensor' not in dispositivo:
            dispositivo['sensor'] = []

        # Obtener el máximo sensor_id actual
        max_sensor_id = max(
            [int(s['sensor_id']) for s in dispositivo['sensor'] if str(s.get('sensor_id')).isdigit()],
            default=0
        )

        # Agregar los sensores nuevos con autoincremento
        for sensor_data in sensors_data:
            if not str(sensor_data.get('sensor_id')).isdigit():  # Si el ID no es válido, generarlo
                max_sensor_id += 1
                sensor_data['sensor_id'] = max_sensor_id

            dispositivo['sensor'].append(sensor_data)  # Agregar el sensor al dispositivo

        # Marcar la columna dispositivos como modificada
        flag_modified(nodo, "dispositivos")

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Sensores agregados correctamente", "nodo": nodo.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error en la base de datos: " + str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Error inesperado: " + str(e)}), 400



@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos', methods=['OPTIONS'])
def options_nodos(nodo_id):
    return '', 200
