from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
import json
from app import db
from app.api import api_bp
from app.models import SavedMeal
from app.schemas import SavedMealSchema

@api_bp.route('/meals', methods=['POST'])
@jwt_required()
def create_saved_meal():
    user_id = get_jwt_identity()
    schema = SavedMealSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    total_calories = sum(f.get('calories', 0) for f in data['foods'])
    total_protein = sum(f.get('protein', 0) for f in data['foods'])
    total_carbs = sum(f.get('carbs', 0) for f in data['foods'])
    total_fat = sum(f.get('fat', 0) for f in data['foods'])
    total_fiber = sum(f.get('fiber', 0) for f in data['foods'])
    
    saved_meal = SavedMeal(
        user_id=user_id,
        name=data['name'],
        description=data.get('description'),
        foods=json.dumps(data['foods']),
        total_calories=total_calories,
        total_protein=total_protein,
        total_carbs=total_carbs,
        total_fat=total_fat,
        total_fiber=total_fiber
    )
    
    db.session.add(saved_meal)
    db.session.commit()
    
    return jsonify({
        'message': 'Saved meal created',
        'meal': saved_meal.to_dict()
    }), 201

@api_bp.route('/meals', methods=['GET'])
@jwt_required()
def get_saved_meals():
    user_id = get_jwt_identity()
    meals = SavedMeal.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'meals': [meal.to_dict() for meal in meals]
    }), 200

@api_bp.route('/meals/<int:meal_id>', methods=['DELETE'])
@jwt_required()
def delete_saved_meal(meal_id):
    user_id = get_jwt_identity()
    meal = SavedMeal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404
    
    db.session.delete(meal)
    db.session.commit()
    
    return jsonify({'message': 'Meal deleted'}), 200