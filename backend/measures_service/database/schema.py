from marshmallow import Schema, fields
from marshmallow.validate import Length

class MedidaSchema(Schema):
    measure_id = fields.Int(dump_only=True)
    nombre_medida = fields.Str(required=True, validate=Length(min=1))
    unidad_medida = fields.Str(required=True, validate=Length(min=1))
    descripcion = fields.Str(required=True, validate=Length(min=1))
    estado = fields.Str(required=True, validate=Length(min=1))
