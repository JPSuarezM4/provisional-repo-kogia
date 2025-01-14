from marshmallow import Schema, fields
from marshmallow.validate import Length

class NodoDataSchema(Schema):
    nodo_id = fields.Int(dump_only=True)
   # nodo_id = fields.Int(required=True)
    suscriptor_id = fields.Int(required=True)
    dispositivos = fields.List(fields.Dict(), required=True)
    nombre_nodo = fields.Str(required=True, validate=Length(min=1))
    # sensores = fields.List(fields.Dict(), required=True)  # Validamos sensores como una lista de dicts
