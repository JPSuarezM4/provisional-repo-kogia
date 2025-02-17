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


@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos', methods=['PUT'])
def update_dispositivos(nodo_id):
    data = request.get_json()
    
    try:
        # Buscar el nodo por su ID
        nodo = NodoData.query.get(nodo_id)
        if not nodo:
            return jsonify({"error": "Nodo no encontrado"}), 404
        
        # Actualizar la información de los dispositivos
        nodo.dispositivos = data.get('dispositivos', nodo.dispositivos)
        
        # Guardar los cambios en la base de datos
        db.session.commit()
        
        return jsonify({"message": "Dispositivos actualizados correctamente", "nodo": nodo.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 400


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


@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos/<int:dispositivo_id>/sensor/<int:sensor_id>/medidas', methods=['PUT'])
def add_medidas_to_sensor(nodo_id, dispositivo_id, sensor_id):
    """
    Agregar medidas a un sensor específico dentro de un dispositivo en un nodo.
    """
    data = request.get_json()

    try:
        # Convertir datetime a ISO 8601 en el JSON recibido
        convert_datetime_to_isoformat(data)

        # Validar las medidas recibidas
        medidas = data.get('medidas')
        if not medidas or not isinstance(medidas, list):
            return jsonify({"error": "Se deben proporcionar medidas en formato de lista"}), 400

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

        # Inicializar el contador de IDs si no existe
        if 'ultimo_id' not in sensor:
            sensor['ultimo_id'] = 0  # Iniciar el contador desde 0

        # Agregar las medidas al sensor
        if 'medidas' not in sensor:
            sensor['medidas'] = []  # Si no tiene medidas, inicializarlo como una lista vacía

        # Generar un ID entero incremental para cada medida y agregar fecha de creación
        for medida in medidas:
            if not isinstance(medida, dict) or 'unidad' not in medida:
                return jsonify({"error": "Cada medida debe tener una 'unidad' "}), 400

            sensor['ultimo_id'] += 1  # Incrementar el contador
            medida['medida_id'] = sensor['ultimo_id']  # Asignar el ID incremental
            medida['fecha_creacion'] = datetime.utcnow().isoformat()  # Agregar fecha de creación

        # Agregar las nuevas medidas al sensor
        sensor['medidas'].extend(medidas)

        # Marcar la columna dispositivos como modificada
        flag_modified(nodo, "dispositivos")

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Medidas agregadas correctamente", "sensor": sensor}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error de base de datos: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 400

    
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
    
    
# Agregar un sensor a un dispositivo específico en un nodo
@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos/<int:dispositivo_id>/sensor', methods=['PUT'])
def add_sensor_to_dispositivo(nodo_id, dispositivo_id):
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
        
        # Buscar el dispositivo dentro del JSON
        dispositivo = next((d for d in nodo.dispositivos if d['dispositivo_id'] == dispositivo_id), None)
        if not dispositivo:
            return jsonify({"error": "Dispositivo no encontrado"}), 404
        
        # Agregar el sensor al campo 'sensores' del dispositivo (si ya existe)
        if 'sensor' not in dispositivo:
            dispositivo['sensor'] = []

        # Verificar que el sensor no exista ya en la lista (opcional)
        existing_sensor_ids = [sensor['sensor_id'] for sensor in dispositivo['sensor']]
        if sensor_data['sensor_id'] in existing_sensor_ids:
            return jsonify({"error": "El sensor ya está agregado a este dispositivo"}), 400

        # Añadir el nuevo sensor
        dispositivo['sensor'].append(sensor_data)

        # Marcar la columna dispositivos como modificada
        flag_modified(nodo, "dispositivos")

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify({"message": "Sensor agregado correctamente", "nodo": nodo.to_dict()}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@nodo_bp.route('/nodos/<int:nodo_id>/dispositivos', methods=['OPTIONS'])
def options_nodos(nodo_id):
    return '', 200


