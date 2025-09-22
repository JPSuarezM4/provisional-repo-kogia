from flask import Flask
from flask_cors import CORS
from config.settings import Config
from database.models import db
from routes.modeling_routes import modeling_bp

app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS correctamente
CORS(app,
     origins=[
         "https://kogia-orcin.vercel.app",
         "https://kogia-qa.up.railway.app"
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Range", "X-Content-Range"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(modeling_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

