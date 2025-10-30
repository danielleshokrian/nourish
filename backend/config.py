import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "app.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    CORS_HEADERS = 'Content-Type'
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}