"""
This module defines the database models for the sensor service.
"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class NodoData(db.Model):
    """
    NodoData represents the data associated with a node in the system.
    """
    __tablename__ = 'nodo_data'
    nodo_id = db.Column(db.Integer, primary_key=True)
   # nodo_id = db.Column(db.Integer, nullable=False, unique=True)
    suscriptor_id = db.Column(db.Integer, nullable=False)
    nombre_nodo = db.Column(db.String(100), nullable=False)
    dispositivos = db.Column(JSON, nullable=False)
    
   # sensores = db.Column(JSON, nullable=False)  # Aquí almacenamos los sensores y medidas como JSON

    def to_dict(self):
        """
        Convert the NodoData instance to a dictionary.
        """
        return {
            'nodo_id': self.nodo_id,
            'suscriptor_id': self.suscriptor_id,
            'dispositivos': self.dispositivos,
            'nombre_nodo': self.nombre_nodo,
          #  'sensores': self.sensores
        }

    def __repr__(self):
        return f"<NodoData nodo_id={self.nodo_id}, dispositivos={self.dispositivos}>"
