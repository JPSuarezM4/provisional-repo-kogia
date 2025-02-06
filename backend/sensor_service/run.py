from flask import Flask
from flask_cors import CORS
from config.settings import Config
from database.models import db
from routes.sensor_routes import nodo_bp

app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS correctamente
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"], "allow_headers": ["Content-Type", "Authorization"], "expose_headers": ["Content-Range", "X-Content-Range"]}}, supports_credentials=True)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(nodo_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
