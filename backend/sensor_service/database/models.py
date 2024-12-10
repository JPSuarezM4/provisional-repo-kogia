from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Modelo Nodo
class Node(db.Model):
    __tablename__ = 'nodes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=True)
    sensors = db.relationship('Sensor', back_populates='node', cascade='all, delete-orphan')

# Modelo Sensor
class Sensor(db.Model):
    __tablename__ = 'sensors'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    manufacturer = db.Column(db.String(100), nullable=False)
    parameters = db.Column(db.JSON, nullable=False)  # Lista de parámetros como diccionario
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    attributes = db.Column(db.JSON, nullable=False)  # Diccionario con "qué mide" y "para qué"
    node_id = db.Column(db.Integer, db.ForeignKey('nodes.id'), nullable=False)
    measurements = db.relationship('Measurement', lazy=True)
    node = db.relationship('Node', back_populates='sensors')

# Modelo Medición
class Measurement(db.Model):
    __tablename__ = 'measurements'
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.id'), nullable=False)
    sensor = db.relationship('Sensor', lazy=True)
