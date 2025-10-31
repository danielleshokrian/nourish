import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///nutrition_tracker.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'
    
    SPOONACULAR_API_KEY = os.environ.get('SPOONACULAR_API_KEY')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}