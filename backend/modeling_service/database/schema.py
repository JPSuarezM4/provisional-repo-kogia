from marshmallow import Schema, fields

class ModelingDatasetSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True)
    descripcion = fields.Str()
    fecha_creacion = fields.DateTime(dump_only=True)
    datos = fields.Raw(required=True)  # Puede ser fields.List(fields.Dict()) si quieres más validación