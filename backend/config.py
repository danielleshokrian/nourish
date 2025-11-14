import os
from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path

basedir = Path(__file__).resolve().parent
load_dotenv(basedir / '.env')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'

    db_url = os.environ.get('DATABASE_URL')
    if not db_url or db_url.startswith('sqlite:///') and not db_url.startswith('sqlite:////'):
        db_path = basedir / 'nutrition_tracker.db'
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'
    else:
        if db_url.startswith('postgres://'):
            db_url = db_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = db_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'

    USDA_API_KEY = os.environ.get('USDA_API_KEY')
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