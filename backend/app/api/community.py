import os
import json
from flask import request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from werkzeug.utils import secure_filename
from datetime import datetime
from app import db
from app.api import api_bp
from app.models import CommunityRecipe, SavedMeal
from app.schemas import CommunityRecipeSchema

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'recipes')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api_bp.route('/community/recipes', methods=['POST'])
@jwt_required()
def create_community_recipe():
    """Share a recipe to the community"""
    user_id = get_jwt_identity()
    
    if 'image' in request.files:
        try:
            recipe_data = json.loads(request.form.get('data', '{}'))
        except json.JSONDecodeError:
            return jsonify({'message': 'Invalid JSON data'}), 400
        
        schema = CommunityRecipeSchema()
        try:
            data = schema.load(recipe_data)
        except ValidationError as err:
            return jsonify({'errors': err.messages}), 400
        
        file = request.files['image']
        if file and allowed_file(file.filename):
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > MAX_FILE_SIZE:
                return jsonify({'message': 'File size exceeds 5MB limit'}), 400
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = secure_filename(file.filename)
            unique_filename = f"{user_id}_{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            file.save(filepath)
            image_filename = unique_filename
        else:
            return jsonify({'message': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
    else:
        schema = CommunityRecipeSchema()
        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return jsonify({'errors': err.messages}), 400
        
        image_filename = None
    
    total_calories = sum(f.get('calories', 0) for f in data['foods'])
    total_protein = sum(f.get('protein', 0) for f in data['foods'])
    total_carbs = sum(f.get('carbs', 0) for f in data['foods'])
    total_fat = sum(f.get('fat', 0) for f in data['foods'])
    total_fiber = sum(f.get('fiber', 0) for f in data['foods'])
    
    recipe = CommunityRecipe(
        user_id=user_id,
        title=data['title'],
        description=data.get('description'),
        instructions=data['instructions'],
        image_filename=image_filename,
        foods=json.dumps(data['foods']),
        total_calories=total_calories,
        total_protein=total_protein,
        total_carbs=total_carbs,
        total_fat=total_fat,
        total_fiber=total_fiber
    )
    
    db.session.add(recipe)
    db.session.commit()
    
    return jsonify({
        'message': 'Recipe shared successfully',
        'recipe': recipe.to_dict()
    }), 201

@api_bp.route('/community/recipes', methods=['GET'])
def get_community_recipes():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '', type=str)
    
    query = CommunityRecipe.query
    
    if search:
        query = query.filter(CommunityRecipe.title.ilike(f'%{search}%'))
    
    query = query.order_by(CommunityRecipe.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'recipes': [recipe.to_dict() for recipe in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@api_bp.route('/community/recipes/<int:recipe_id>', methods=['GET'])
def get_community_recipe(recipe_id):
    recipe = CommunityRecipe.query.get(recipe_id)
    
    if not recipe:
        return jsonify({'message': 'Recipe not found'}), 404
    
    return jsonify({
        'recipe': recipe.to_dict()
    }), 200

@api_bp.route('/community/recipes/<int:recipe_id>/image', methods=['GET'])
def get_recipe_image(recipe_id):
    recipe = CommunityRecipe.query.get(recipe_id)
    
    if not recipe or not recipe.image_filename:
        return jsonify({'message': 'Image not found'}), 404

    filepath = os.path.join(UPLOAD_FOLDER, recipe.image_filename)

    if not os.path.exists(filepath):

        return jsonify({'message': 'Image file not found'}), 404

    ext = recipe.image_filename.rsplit('.', 1)[1].lower() if '.' in recipe.image_filename else 'jpg'
    mimetype_map = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp'

    }
    mimetype = mimetype_map.get(ext, 'image/jpeg')

    response = send_file(filepath, mimetype=mimetype)

    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
    return response
    
@api_bp.route('/community/recipes/<int:recipe_id>/import', methods=['POST'])
@jwt_required()
def import_recipe_to_saved_meals(recipe_id):
    user_id = get_jwt_identity()
    recipe = CommunityRecipe.query.get(recipe_id)
    
    if not recipe:
        return jsonify({'message': 'Recipe not found'}), 404
    
    saved_meal = SavedMeal(
        user_id=user_id,
        name=recipe.title,
        description=f"Imported from community recipe by {recipe.user.name}",
        foods=recipe.foods,  
        total_calories=recipe.total_calories,
        total_protein=recipe.total_protein,
        total_carbs=recipe.total_carbs,
        total_fat=recipe.total_fat,
        total_fiber=recipe.total_fiber
    )
    
    db.session.add(saved_meal)
    db.session.commit()
    
    return jsonify({
        'message': 'Recipe imported to your saved meals',
        'meal': saved_meal.to_dict()
    }), 201

@api_bp.route('/community/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_community_recipe(recipe_id):
    user_id = get_jwt_identity()
    recipe = CommunityRecipe.query.filter_by(id=recipe_id, user_id=user_id).first()
    
    if not recipe:
        return jsonify({'message': 'Recipe not found or you do not have permission'}), 404
    
    if recipe.image_filename:
        filepath = os.path.join(UPLOAD_FOLDER, recipe.image_filename)
        if os.path.exists(filepath):
            os.remove(filepath)
    
    db.session.delete(recipe)
    db.session.commit()
    
    return jsonify({'message': 'Recipe deleted'}), 200

@api_bp.route('/community/recipes/from-saved-meal/<int:meal_id>', methods=['GET'])
@jwt_required()
def get_saved_meal_for_sharing(meal_id):
    """Get saved meal data formatted for sharing (helper endpoint)"""
    user_id = get_jwt_identity()
    meal = SavedMeal.query.filter_by(id=meal_id, user_id=user_id).first()
    
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404
    
    return jsonify({
        'meal': meal.to_dict()
    }), 200