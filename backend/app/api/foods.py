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
    if spoonacular_key and len(results) < 10: 
        try:
            search_response = requests.get(
                'https://api.spoonacular.com/food/ingredients/search',
                params={
                    'query': query, 
                    'apiKey': spoonacular_key, 
                    'number': 5,
                    'metaInformation': True
                },
                timeout=3
            )
            
            if search_response.status_code == 200:
                spoonacular_results = search_response.json().get('results', [])
                
                for item in spoonacular_results:
                    try:
                        nutrition_response = requests.get(
                            f'https://api.spoonacular.com/food/ingredients/{item["id"]}/information',
                            params={
                                'apiKey': spoonacular_key,
                                'amount': 100,
                                'unit': 'grams'
                            },
                            timeout=3
                        )
                        
                        if nutrition_response.status_code == 200:
                            nutrition_data = nutrition_response.json()
                            nutrients = nutrition_data.get('nutrition', {}).get('nutrients', [])
                            
                            def get_nutrient(name):
                                for n in nutrients:
                                    if n['name'] == name:
                                        return n['amount']
                                return 0
                            
                            results.append({
                                'id': f"spoon_{item['id']}",  
                                'name': item['name'].title(),
                                'calories': get_nutrient('Calories'),
                                'protein': get_nutrient('Protein'),
                                'carbs': get_nutrient('Carbohydrates'),
                                'fat': get_nutrient('Fat'),
                                'fiber': get_nutrient('Fiber'),
                                'type': 'spoonacular'
                            })
                    except Exception as e:
                        continue
                        
        except Exception as e:
            print(f"Spoonacular API error: {e}")
            pass

    return jsonify({'results': results}), 200

@api_bp.route('/foods/spoonacular/<string:spoon_id>', methods=['POST'])
@jwt_required()
def save_spoonacular_food(spoon_id):
    """Save a Spoonacular food to the local database"""
    
    if spoon_id.startswith('spoon_'):
        spoon_id = spoon_id.replace('spoon_', '')
    
    existing = Food.query.filter_by(name=f"spoon_{spoon_id}").first()
    if existing:
        return jsonify({'food': existing.to_dict()}), 200
    
    spoonacular_key = os.getenv('SPOONACULAR_API_KEY')
    if not spoonacular_key:
        return jsonify({'message': 'Spoonacular API not configured'}), 500
    
    try:
        response = requests.get(
            f'https://api.spoonacular.com/food/ingredients/{spoon_id}/information',
            params={
                'apiKey': spoonacular_key,
                'amount': 100,
                'unit': 'grams'
            },
            timeout=5
        )
        
        if response.status_code != 200:
            return jsonify({'message': 'Failed to fetch food data'}), 500
        
        data = response.json()
        nutrients = data.get('nutrition', {}).get('nutrients', [])
        
        def get_nutrient(name):
            for n in nutrients:
                if n['name'] == name:
                    return n['amount']
            return 0
        
        food = Food(
            name=data['name'].title(),
            calories=get_nutrient('Calories'),
            protein=get_nutrient('Protein'),
            carbs=get_nutrient('Carbohydrates'),
            fat=get_nutrient('Fat'),
            fiber=get_nutrient('Fiber')
        )
        
        db.session.add(food)
        db.session.commit()
        
        return jsonify({'food': food.to_dict()}), 201
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

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
