from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class ModelingDataset(db.Model):
    __tablename__ = 'modeling_datasets'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(128), nullable=False)
    descripcion = db.Column(db.String(256))
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())
    datos = db.Column(JSON, nullable=False)  # Aquí guardas el array de datos exportados

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'datos': self.datos
        }

    def __repr__(self):
        return f"<ModelingDataset id={self.id}, nombre={self.nombre}>"