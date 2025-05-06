import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from database import db
from models import User
from flask_cors import CORS


load_dotenv()

app = Flask(__name__)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")  # Cambia esto por tu URL de base de datos
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Cambia esto por una clave secreta segura
jwt = JWTManager(app)

# Habilitar CORS
CORS(app, resources={r"/api/*": {"origins": ["https://kogia-orcin.vercel.app/", "https://kogia-qa.up.railway.app/"], "allow_headers": ["Content-Type", "Authorization"], "expose_headers": ["Content-Range", "X-Content-Range"]}}, supports_credentials=True)

db.init_app(app)

# Crear tablas
with app.app_context():
    db.create_all()

# Ruta para login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Credenciales incorrectas"}), 401

    # Crear un token JWT
    access_token = create_access_token(identity={"email": user.email, "role": user.role})
    return jsonify({"token": access_token}), 200

# Ruta protegida
@app.route('/api/admin', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user = get_jwt_identity()  # Obtener información del token
    return jsonify({"message": f"Bienvenido, {current_user['email']}"}), 200

@app.route('/api/create-user', methods=['POST'])
def create_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'admin')  # Por defecto, el rol será 'admin'

    # Validar que los campos no estén vacíos
    if not email or not password:
        return jsonify({"message": "Email y contraseña son requeridos"}), 400

    # Verificar si el usuario ya existe
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "El usuario ya existe"}), 400

    # Crear un nuevo usuario
    new_user = User(email=email, password=password)
    new_user.role = role  # Asignar el rol
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"Usuario {email} creado exitosamente con rol {role}"}), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)