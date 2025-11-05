from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
import json
from datetime import datetime
from app import db
from app.api import api_bp
from app.models import FoodEntry, SavedMeal
from app.schemas import SavedMealSchema

@api_bp.route('/meals', methods=['POST'])
# Creates a new saved meal
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


@api_bp.route('/meals/<int:meal_id>/add', methods=['POST'])
# Adds saved meal to a specific day
@jwt_required()
def add_saved_meal_to_day(meal_id):
    user_id = get_jwt_identity()
    meal = SavedMeal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404
    
    data = request.json
    date_str = data.get('date')
    meal_type = data.get('meal_type')
    
    if not date_str or not meal_type:
        return jsonify({'message': 'Date and meal_type are required'}), 400
    
    valid_meal_types = ['breakfast', 'lunch', 'dinner', 'snacks']
    if meal_type not in valid_meal_types:
        return jsonify({'message': 'Invalid meal_type'}), 400
    
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    foods = json.loads(meal.foods)
    
    created_entries = []
    for food in foods:
        entry = FoodEntry(
            user_id=user_id,
            food_id=food.get('food_id'),
            custom_food_id=food.get('custom_food_id'),
            date=date_obj,
            meal_type=meal_type,
            quantity=int(food['quantity']),
            calories=int(food['calories']),
            protein=int(food['protein']),
            carbs=int(food['carbs']),
            fat=int(food['fat']),
            fiber=int(food.get('fiber', 0))
        )
        db.session.add(entry)
        created_entries.append(entry)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Meal added to your day',
        'entries': [entry.to_dict() for entry in created_entries]
    }), 201

@api_bp.route('/meals', methods=['GET'])
@jwt_required()
def get_saved_meals():
    user_id = get_jwt_identity()
    meals = SavedMeal.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'meals': [meal.to_dict() for meal in meals]
    }), 200

@api_bp.route('/meals/<int:meal_id>', methods=['PUT'])
@jwt_required()
def update_saved_meal(meal_id):
    user_id = get_jwt_identity()
    meal = SavedMeal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404
    
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
    
    meal.name = data['name']
    meal.description = data.get('description')
    meal.foods = json.dumps(data['foods'])
    meal.total_calories = total_calories
    meal.total_protein = total_protein
    meal.total_carbs = total_carbs
    meal.total_fat = total_fat
    meal.total_fiber = total_fiber
    
    db.session.commit()
    
    return jsonify({
        'message': 'Meal updated successfully',
        'meal': meal.to_dict()
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