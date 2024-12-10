from marshmallow import Schema, fields, validate

# Esquema para Mediciones
class MeasurementSchema(Schema):
    timestamp = fields.DateTime(required=True)
    value = fields.Float(required=True)
    sensor_id = fields.Int(required=True)

# Esquema para Sensores
class SensorSchema(Schema):
    code = fields.Str(required=True, validate=validate.Length(max=50))
    type = fields.Str(required=True)
    manufacturer = fields.Str(required=True)
    parameters = fields.Dict(required=True)  # Se espera un diccionario
    latitude = fields.Float(required=True)
    longitude = fields.Float(required=True)
    attributes = fields.Dict(required=True)  # Se espera un diccionario
    node_id = fields.Int(required=True)

# Esquema para Nodos
class NodeSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(max=100))
    location = fields.Str(validate=validate.Length(max=255))
