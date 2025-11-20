from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
import os
import json

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(30), nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    daily_calories = db.Column(db.Integer, default=2000)
    daily_protein = db.Column(db.Integer, default=50)
    daily_carbs = db.Column(db.Integer, default=275)
    daily_fat = db.Column(db.Integer, default=78)
    daily_fiber = db.Column(db.Integer, default=28)

    food_entries = db.relationship('FoodEntry', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    custom_foods = db.relationship('CustomFood', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    saved_meals = db.relationship('SavedMeal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'daily_calories': self.daily_calories,
            'daily_protein': self.daily_protein,
            'daily_carbs': self.daily_carbs,
            'daily_fat': self.daily_fat,
            'daily_fiber': self.daily_fiber
        }

class Food(db.Model):
    __tablename__ = 'foods'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    brand = db.Column(db.String(50))
    barcode = db.Column(db.String(20))
    
    # Nutrition per 100g
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Integer, nullable=False)
    carbs = db.Column(db.Integer, nullable=False)
    fat = db.Column(db.Integer, nullable=False)
    fiber = db.Column(db.Integer, default=0)
    sugar = db.Column(db.Integer)
    sodium = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'fiber': self.fiber,
            'per': '100g'
        }

class CustomFood(db.Model):
    __tablename__ = 'custom_foods'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50))
    serving_size = db.Column(db.Integer, nullable=False)
    
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Integer, nullable=False)
    carbs = db.Column(db.Integer, nullable=False)
    fat = db.Column(db.Integer, nullable=False)
    fiber = db.Column(db.Integer, default=0)
    sugar = db.Column(db.Integer)
    sodium = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'serving_size': self.serving_size,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'fiber': self.fiber
        }

class FoodEntry(db.Model):
    __tablename__ = 'food_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey('foods.id'))
    custom_food_id = db.Column(db.Integer, db.ForeignKey('custom_foods.id'))
    
    date = db.Column(db.Date, nullable=False, index=True)
    meal_type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Integer, nullable=False)
    carbs = db.Column(db.Integer, nullable=False)
    fat = db.Column(db.Integer, nullable=False)
    fiber = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    food = db.relationship('Food', backref='entries')
    custom_food = db.relationship('CustomFood', backref='entries')
    
    def to_dict(self):
        return {
            'id': self.id,
            'food_id': self.food_id,
            'custom_food_id': self.custom_food_id,
            'name': self.food.name if self.food else self.custom_food.name,
            'date': self.date.isoformat(),
            'meal_type': self.meal_type,
            'quantity': self.quantity,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'fiber': self.fiber
        }

class SavedMeal(db.Model):
    __tablename__ = 'saved_meals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    foods = db.Column(db.Text, nullable=False)  
    
    total_calories = db.Column(db.Integer, nullable=False)
    total_protein = db.Column(db.Integer, nullable=False)
    total_carbs = db.Column(db.Integer, nullable=False)
    total_fat = db.Column(db.Integer, nullable=False)
    total_fiber = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'foods': json.loads(self.foods),
            'total_calories': self.total_calories,
            'total_protein': self.total_protein,
            'total_carbs': self.total_carbs,
            'total_fat': self.total_fat,
            'total_fiber': self.total_fiber
        }
    
class CommunityRecipe(db.Model):
    __tablename__ = 'community_recipes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    instructions = db.Column(db.Text, nullable=False)
    image_filename = db.Column(db.String(255))  
    
    foods = db.Column(db.Text, nullable=False)  
    total_calories = db.Column(db.Integer, nullable=False)
    total_protein = db.Column(db.Integer, nullable=False)
    total_carbs = db.Column(db.Integer, nullable=False)
    total_fat = db.Column(db.Integer, nullable=False)
    total_fiber = db.Column(db.Integer, nullable=False)
    
    likes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('community_recipes', lazy='dynamic'))
    
    def to_dict(self, include_user=True):
        backend_url = os.environ.get('BACKEND_URL', 'https://nourish-muv1.onrender.com')
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'instructions': self.instructions,
            'image_url': f'{backend_url}/community/recipes/{self.id}/image' if self.image_filename else None,
            'foods': json.loads(self.foods),
            'total_calories': self.total_calories,
            'total_protein': self.total_protein,
            'total_carbs': self.total_carbs,
            'total_fat': self.total_fat,
            'total_fiber': self.total_fiber,
            'likes_count': self.likes_count,
            'created_at': self.created_at.isoformat()

        }
        if include_user:
            result['creator'] = {
                'id': self.user.id,
                'name': self.user.name
            }
        
        return result