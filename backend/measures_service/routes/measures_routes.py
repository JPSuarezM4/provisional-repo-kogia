"""
This module defines the routes for managing measures.
"""

from flask import Blueprint, request, jsonify
from database.models import MedidaData, db
from database.schema import MedidaSchema

medida_bp = Blueprint('measures', __name__)
medida_schema = MedidaSchema()
medidas_schema = MedidaSchema(many=True)

@medida_bp.route("/measures/", methods=["POST"])
def add_measure():
    """
    Add a new measure to the database.
    """
    data = request.get_json()
    errors = medida_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    new_measure = MedidaData(
        nombre_medida=data['nombre_medida'],
        unidad_medida=data['unidad_medida'],
        descripcion=data['descripcion'],
        estado=data['estado']
    )
    db.session.add(new_measure)
    db.session.commit()
    return jsonify(medida_schema.dump(new_measure)), 201

@medida_bp.route("/measures/<int:measure_id>", methods=["PUT"])
def edit_measure(measure_id):
    """
    Edit an existing measure in the database.
    """
    data = request.get_json()
    errors = medida_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    measure = db.session.query(MedidaData).filter(MedidaData.measure_id == measure_id).first()
    if measure:
        measure.nombre_medida = data['nombre_medida']
        measure.unidad_medida = data['unidad_medida']
        measure.descripcion = data['descripcion']
        measure.estado = data['estado']
        db.session.commit()
        return jsonify(medida_schema.dump(measure))
    return jsonify({"detail": "Measure not found"}), 404

@medida_bp.route("/measures/<int:measure_id>", methods=["DELETE"])
def delete_measure(measure_id):
    """
    Delete a measure from the database.
    """
    measure = db.session.query(MedidaData).filter(MedidaData.measure_id == measure_id).first()
    if measure:
        db.session.delete(measure)
        db.session.commit()
        return jsonify(medida_schema.dump(measure))
    return jsonify({"detail": "Measure not found"}), 404

@medida_bp.route("/measures/", methods=["GET"])
def get_measures():
    """
    Get all measures from the database.
    """
    measures = db.session.query(MedidaData).all()
    return jsonify(medidas_schema.dump(measures))
