from flask import Blueprint, request, jsonify
from database.models import db, Sensor, Node, Measurement
from database.schema import SensorSchema, NodeSchema, MeasurementSchema

sensor_bp = Blueprint('sensors', __name__)
sensor_schema = SensorSchema()

@sensor_bp.route('/nodes', methods=['POST'])
def create_node():
    data = request.get_json()
    schema = NodeSchema()
    try:
        validated_data = schema.load(data)
        node = Node(**validated_data)
        db.session.add(node)
        db.session.commit()
        return jsonify(schema.dump(node)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@sensor_bp.route('/nodes', methods=['GET'])
def get_nodes():
    nodes = Node.query.all()
    schema = NodeSchema(many=True)
    return jsonify(schema.dump(nodes)), 200

@sensor_bp.route('/sensors', methods=['POST'])
def create_sensor():
    data = request.json
    node_id = data.get('node_id')
    errors = sensor_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    # Validar código único
    if Sensor.query.filter_by(code=data['code']).first():
        return jsonify({"error": "Sensor code already exists"}), 400

    sensor = Sensor(
        code=data['code'],
        type=data['type'],
        manufacturer=data['manufacturer'],
        parameters=data['parameters'],
        latitude=data['latitude'],
        longitude=data['longitude'],
        attributes=data['attributes'],
        node_id=node_id
    )
    db.session.add(sensor)
    db.session.commit()
    return jsonify(sensor_schema.dump(sensor)), 201

@sensor_bp.route('/sensors', methods=['GET'])
def get_sensors():
    sensors = Sensor.query.all()
    return jsonify(sensor_schema.dump(sensors, many=True)), 200

# Obtener todos los sensores de un nodo
@sensor_bp.route('/nodes/<int:node_id>/sensors', methods=['GET'])
def get_sensors_by_node(node_id):
    sensors = Sensor.query.filter_by(node_id=node_id).all()
    schema = SensorSchema(many=True)
    return jsonify(schema.dump(sensors)), 200

# Crear Mediciones
@sensor_bp.route('/measurements', methods=['POST'])
def create_measurement():
    data = request.get_json()
    schema = MeasurementSchema()
    try:
        validated_data = schema.load(data)
        
        # Buscamos el sensor usando el sensor_id
        sensor = Sensor.query.get(validated_data['sensor_id'])
        if not sensor:
            return jsonify({"error": "Sensor not found"}), 404
        
        # Creamos la medición asociada al sensor encontrado
        measurement = Measurement(
            value=validated_data['value'],
            timestamp=validated_data['timestamp'],
            sensor=sensor  # Establecemos la relación correctamente
        )

        db.session.add(measurement)
        db.session.commit()
        return jsonify(schema.dump(measurement)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Obtener todas las mediciones de un sensor
@sensor_bp.route('/sensors/<int:sensor_id>/measurements', methods=['GET'])
def get_measurements_by_sensor(sensor_id):
    measurements = Measurement.query.filter_by(sensor_id=sensor_id).all()
    schema = MeasurementSchema(many=True)
    return jsonify(schema.dump(measurements)), 200
