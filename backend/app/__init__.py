from flask import Flask, app
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config


db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:5173",
                "https://nourish-xi.vercel.app"
            ]
        }
    })
    
    from app.auth import auth_bp
    from app.api import api_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    return app