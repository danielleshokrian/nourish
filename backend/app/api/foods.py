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

    usda_key = os.getenv('USDA_API_KEY')
    if usda_key and len(results) < 10:
        try:
            search_response = requests.post(
                'https://api.nal.usda.gov/fdc/v1/foods/search',
                params={'api_key': usda_key},
                json={
                    'query': query,
                    'pageSize': 5,
                    'dataType': ['Branded', 'SR Legacy', 'Foundation']
                },
                timeout=5
            )
            
            if search_response.status_code == 200:
                usda_results = search_response.json().get('foods', [])
                
                for item in usda_results:
                    food_nutrients = item.get('foodNutrients', [])
                    
                    def get_nutrient(nutrient_name):
                        for nutrient in food_nutrients:
                            name = nutrient.get('nutrientName', '')
                            if nutrient_name.lower() in name.lower():
                                return nutrient.get('value', 0)
                        return 0
                    
                    label_nutrients = item.get('labelNutrients', {})
                    
                    results.append({
                        'id': f"usda_{item['fdcId']}",
                        'name': item.get('description', '').title(),
                        'calories': label_nutrients.get('calories', {}).get('value') or get_nutrient('Energy'),
                        'protein': label_nutrients.get('protein', {}).get('value') or get_nutrient('Protein'),
                        'carbs': label_nutrients.get('carbohydrates', {}).get('value') or get_nutrient('Carbohydrate'),
                        'fat': label_nutrients.get('fat', {}).get('value') or get_nutrient('Total lipid'),
                        'fiber': label_nutrients.get('fiber', {}).get('value') or get_nutrient('Fiber'),
                        'type': 'usda'
                    })
                    
        except Exception as e:
            print(f"USDA API error: {e}")
            pass

    return jsonify({'results': results}), 200

@api_bp.route('/foods/usda/<string:usda_id>', methods=['POST'])
@jwt_required()
def save_usda_food(usda_id):
    """Save a USDA food to the local database"""
    
    if usda_id.startswith('usda_'):
        fdc_id = usda_id.replace('usda_', '')
    else:
        fdc_id = usda_id
    
    existing = Food.query.filter_by(name=f"usda_{fdc_id}").first()
    if existing:
        return jsonify({'food': existing.to_dict()}), 200
    
    usda_key = os.getenv('USDA_API_KEY')
    if not usda_key:
        return jsonify({'message': 'USDA API not configured'}), 500
    
    try:
        response = requests.get(
            f'https://api.nal.usda.gov/fdc/v1/food/{fdc_id}',
            params={'api_key': usda_key},
            timeout=5
        )
        
        if response.status_code != 200:
            return jsonify({'message': 'Failed to fetch food data'}), 500
        
        data = response.json()
        food_nutrients = data.get('foodNutrients', [])
        
        def get_nutrient(nutrient_name):
            for nutrient in food_nutrients:
                name = nutrient.get('nutrient', {}).get('name', '')
                if nutrient_name.lower() in name.lower():
                    return nutrient.get('amount', 0)
            return 0
        
        label_nutrients = data.get('labelNutrients', {})
        
        food = Food(
            name=data.get('description', 'Unknown').title(),
            calories=label_nutrients.get('calories', {}).get('value') or get_nutrient('Energy'),
            protein=label_nutrients.get('protein', {}).get('value') or get_nutrient('Protein'),
            carbs=label_nutrients.get('carbohydrates', {}).get('value') or get_nutrient('Carbohydrate'),
            fat=label_nutrients.get('fat', {}).get('value') or get_nutrient('Total lipid'),
            fiber=label_nutrients.get('fiber', {}).get('value') or get_nutrient('Fiber')
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
