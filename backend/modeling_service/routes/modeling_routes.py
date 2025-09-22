from flask import Blueprint, request, jsonify
from database.models import ModelingDataset, db
from database.schema import ModelingDatasetSchema

modeling_bp = Blueprint('modeling', __name__)
modeling_schema = ModelingDatasetSchema()
modelings_schema = ModelingDatasetSchema(many=True)

@modeling_bp.route("/modeling-datasets/", methods=["POST"])
def add_modeling_dataset():
    data = request.get_json()
    errors = modeling_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    new_dataset = ModelingDataset(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        datos=data['datos']
    )
    db.session.add(new_dataset)
    db.session.commit()
    return jsonify(modeling_schema.dump(new_dataset)), 201

@modeling_bp.route("/modeling-datasets/", methods=["GET"])
def get_modeling_datasets():
    datasets = db.session.query(ModelingDataset).all()
    return jsonify(modelings_schema.dump(datasets))

@modeling_bp.route("/modeling-datasets/<int:dataset_id>", methods=["GET"])
def get_modeling_dataset(dataset_id):
    dataset = db.session.query(ModelingDataset).filter(ModelingDataset.id == dataset_id).first()
    if dataset:
        return jsonify(modeling_schema.dump(dataset))
    return jsonify({"detail": "Dataset not found"}), 404

@modeling_bp.route("/modeling-datasets/<int:dataset_id>", methods=["DELETE"])
def delete_modeling_dataset(dataset_id):
    dataset = db.session.query(ModelingDataset).filter(ModelingDataset.id == dataset_id).first()
    if dataset:
        db.session.delete(dataset)
        db.session.commit()
        return jsonify(modeling_schema.dump(dataset))
    return jsonify({"detail": "Dataset not found"}), 404 