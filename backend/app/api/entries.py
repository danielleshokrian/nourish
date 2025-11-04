from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from datetime import datetime
from app import db
from app.api import api_bp
from app.models import FoodEntry, Food, CustomFood, User
from app.schemas import FoodEntrySchema

@api_bp.route('/entries', methods=['POST'])
@jwt_required()
def create_entry():
    user_id = int(get_jwt_identity())
    schema = FoodEntrySchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    if data.get('food_id'):
        food_id = data['food_id']
        
        if isinstance(food_id, str) and food_id.startswith('spoon_'):
            return jsonify({
                'message': 'Please add this food as a custom food first'
            }), 400
        
        food = Food.query.get(food_id)
        if not food:
            return jsonify({'message': 'Food not found'}), 404
        
        multiplier = data['quantity'] / 100
        calories = food.calories * multiplier
        protein = food.protein * multiplier
        carbs = food.carbs * multiplier
        fat = food.fat * multiplier
        fiber = food.fiber * multiplier
        
    elif data.get('custom_food_id'):
        custom_food = CustomFood.query.filter_by(
            id=data['custom_food_id'],
            user_id=user_id
        ).first()
        if not custom_food:
            return jsonify({'message': 'Custom food not found'}), 404
        
        multiplier = data['quantity'] / custom_food.serving_size
        calories = custom_food.calories * multiplier
        protein = custom_food.protein * multiplier
        carbs = custom_food.carbs * multiplier
        fat = custom_food.fat * multiplier
        fiber = custom_food.fiber * multiplier
    
    entry = FoodEntry(
        user_id=user_id,
        food_id=data.get('food_id'),
        custom_food_id=data.get('custom_food_id'),
        date=data['date'],
        meal_type=data['meal_type'],
        quantity=data['quantity'],
        calories=calories,
        protein=protein,
        carbs=carbs,
        fat=fat,
        fiber=fiber
    )
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Entry created',
        'entry': entry.to_dict()
    }), 201

@api_bp.route('/entries', methods=['GET'])
@jwt_required()
def get_entries():
    user_id = get_jwt_identity()
    user_id = int(user_id)
    date_str = request.args.get('date')
    
    if not date_str:
        return jsonify({'message': 'Date parameter required'}), 400
    
    try:
        query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    entries = FoodEntry.query.filter_by(
        user_id=user_id,
        date=query_date
    ).all()
    
    meals = {
        'breakfast': [],
        'lunch': [],
        'dinner': [],
        'snacks': []
    }
    
    for entry in entries:
        meals[entry.meal_type].append(entry.to_dict())
    
    return jsonify(meals), 200

@api_bp.route('/entries/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    user_id = get_jwt_identity()
    user_id = int(user_id)
    entry = FoodEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'message': 'Entry not found'}), 404
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({'message': 'Entry deleted'}), 200

@api_bp.route('/entries/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_entry(entry_id):
    user_id = get_jwt_identity()
    user_id = int(user_id)
    entry = FoodEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'message': 'Entry not found'}), 404
    
    data = request.json
    new_quantity = data.get('quantity')
    
    if not new_quantity or new_quantity <= 0:
        return jsonify({'message': 'Invalid quantity'}), 400
    
    if entry.food_id:
        food = Food.query.get(entry.food_id)
        if not food:
            return jsonify({'message': 'Food not found'}), 404
        
        multiplier = new_quantity / 100
        entry.quantity = new_quantity
        entry.calories = food.calories * multiplier
        entry.protein = food.protein * multiplier
        entry.carbs = food.carbs * multiplier
        entry.fat = food.fat * multiplier
        entry.fiber = food.fiber * multiplier
        
    elif entry.custom_food_id:
        custom_food = CustomFood.query.filter_by(
            id=entry.custom_food_id,
            user_id=user_id
        ).first()
        if not custom_food:
            return jsonify({'message': 'Custom food not found'}), 404
        
        multiplier = new_quantity / custom_food.serving_size
        entry.quantity = new_quantity
        entry.calories = custom_food.calories * multiplier
        entry.protein = custom_food.protein * multiplier
        entry.carbs = custom_food.carbs * multiplier
        entry.fat = custom_food.fat * multiplier
        entry.fiber = custom_food.fiber * multiplier
    
    db.session.commit()
    
    return jsonify({
        'message': 'Entry updated',
        'entry': entry.to_dict()
    }), 200

@api_bp.route('/entries/clear', methods=['DELETE'])
@jwt_required()
def clear_meal_entries():
    user_id = get_jwt_identity()
    user_id = int(user_id)
    date_str = request.args.get('date')
    meal_type = request.args.get('meal_type')
    
    if not date_str or not meal_type:
        return jsonify({'message': 'Date and meal_type parameters required'}), 400
    
    try:
        query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if meal_type not in ['breakfast', 'lunch', 'dinner', 'snacks']:
        return jsonify({'message': 'Invalid meal type'}), 400
    
    deleted_count = FoodEntry.query.filter_by(
        user_id=user_id,
        date=query_date,
        meal_type=meal_type
    ).delete()
    
    db.session.commit()
    
    return jsonify({
        'message': f'{deleted_count} entries deleted',
        'count': deleted_count
    }), 200

@api_bp.route('/summary/<string:date_str>', methods=['GET'])
@jwt_required()
def get_daily_summary(date_str):
    user_id = get_jwt_identity()
    user_id = int(user_id)
    user = User.query.get(user_id)
    
    try:
        query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    
    entries = FoodEntry.query.filter_by(
        user_id=user_id,
        date=query_date
    ).all()
    
    totals = {
        'calories': sum(e.calories for e in entries),
        'protein': sum(e.protein for e in entries),
        'carbs': sum(e.carbs for e in entries),
        'fat': sum(e.fat for e in entries),
        'fiber': sum(e.fiber for e in entries)
    }
    
    nutrients = {}
    for nutrient in totals:
        goal_attr = f'daily_{nutrient}'
        goal = getattr(user, goal_attr, 1)
        nutrients[nutrient] = {
            'consumed': round(totals[nutrient], 1),
            'goal': goal,
            'percentage': round((totals[nutrient] / goal * 100) if goal > 0 else 0, 1)
        }
    
    return jsonify({
        'date': date_str,
        'nutrients': nutrients
    }), 200
