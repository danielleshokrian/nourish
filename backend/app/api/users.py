from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app import db
from app.api import api_bp
from app.models import User
from app.schemas import GoalsUpdateSchema

@api_bp.route('/users/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@api_bp.route('/users/goals', methods=['PUT'])
@jwt_required()
def update_goals():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    schema = GoalsUpdateSchema()
    
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    for key, value in data.items():
        setattr(user, key, value)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Goals updated successfully',
        'user': user.to_dict()
    }), 200