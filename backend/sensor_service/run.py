from flask import Flask
from config.settings import Config
from database.models import db
from routes.sensor_routes import sensor_bp

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(sensor_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
