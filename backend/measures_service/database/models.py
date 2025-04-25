"""
This module defines the database models for the sensor service.
"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class MedidaData(db.Model):
    """
    NodoData represents the data associated with a node in the system.
    """
    __tablename__ = 'measure_data'
    measure_id = db.Column(db.Integer, primary_key=True)
    nombre_medida = db.Column(db.String(100), nullable=False)
    unidad_medida = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.String(200), nullable=False)
    estado = db.Column(db.String(10), nullable=False)  # activo/inactivo
    max = db.Column(db.Float, nullable=False)
    min = db.Column(db.Float, nullable=False)

    def to_dict(self):
        """
        Convert the NodoData instance to a dictionary.
        """
        return {
            'measure_id': self.measure_id,
            'nombre_medida': self.nombre_medida,
            'unidad_medida': self.unidad_medida,
            'descripcion': self.descripcion,
            'estado': self.estado,
            'max': self.max,
            'min': self.min
        }

    def __repr__(self):
        return f"<NodoData measure_id={self.measure_id}, nombre_medida={self.nombre_medida}, estado={self.estado}>"
