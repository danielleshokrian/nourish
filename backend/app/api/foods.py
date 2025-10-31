from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app import db
from app.api import api_bp
from app.models import Food, CustomFood
from app.schemas import CustomFoodSchema
import requests
import os

@api_bp.route('/foods/search', methods=['GET'])
@jwt_required()
def search_foods():
    query = request.args.get('q', '').strip()
    
    if len(query) < 2:
        return jsonify({'results': []}), 200
    
    foods = Food.query.filter(Food.name.contains(query)).limit(10).all()
    results = [food.to_dict() for food in foods]
    
    user_id = int(get_jwt_identity())
    custom_foods = CustomFood.query.filter_by(user_id=user_id).filter(
        CustomFood.name.contains(query)
    ).limit(5).all()
    
    for food in custom_foods:
        food_dict = food.to_dict()
        food_dict['type'] = 'custom'
        results.append(food_dict)
    
    spoonacular_key = os.getenv('SPOONACULAR_API_KEY')
    if spoonacular_key:
        try:
            response = requests.get(
                'https://api.spoonacular.com/food/ingredients/search',
                params={'query': query, 'apiKey': spoonacular_key, 'number': 5}
            )
            if response.status_code == 200:
                spoonacular_results = response.json().get('results', [])
                for item in spoonacular_results:
                    results.append({
                        'id': item.get('id'),
                        'name': item.get('name'),
                        'type': 'spoonacular'
                    })
        except Exception as e:
            pass

    return jsonify({'results': results}), 200

@api_bp.route('/foods/custom', methods=['POST'])
@jwt_required()
def create_custom_food():
    user_id = get_jwt_identity()
    schema = CustomFoodSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    custom_food = CustomFood(
        user_id=user_id,
        **data
    )
    
    db.session.add(custom_food)
    db.session.commit()
    
    return jsonify({
        'message': 'Custom food created',
        'food': custom_food.to_dict()
    }), 201

@api_bp.route('/foods/custom', methods=['GET'])
@jwt_required()
def get_custom_foods():
    user_id = get_jwt_identity()
    foods = CustomFood.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'foods': [food.to_dict() for food in foods]
    }), 200
