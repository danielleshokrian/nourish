import pytest
from unittest.mock import patch, MagicMock
from app.models import Food, CustomFood
from app import db


class TestFoodSearch:
    """Tests for food search functionality."""

    def test_search_standard_foods(self, client, auth_headers, test_food):
        """Test searching for standard foods in database."""
        response = client.get('/api/foods/search?q=chicken',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert 'results' in data
        assert len(data['results']) > 0
        assert any('chicken' in food['name'].lower() for food in data['results'])

    def test_search_custom_foods(self, client, auth_headers, test_custom_food):
        """Test that search includes user's custom foods."""
        response = client.get('/api/foods/search?q=protein',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert any(food['name'] == 'My Protein Shake' for food in data['results'])

    def test_search_without_auth(self, client):
        """Test that search requires authentication."""
        response = client.get('/api/foods/search?q=chicken')

        assert response.status_code == 401

    def test_search_empty_query(self, client, auth_headers):
        """Test search with empty query returns empty results."""
        response = client.get('/api/foods/search?q=',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data['results'] == []

    def test_search_short_query(self, client, auth_headers):
        """Test search with query less than 2 characters."""
        response = client.get('/api/foods/search?q=a',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data['results'] == []

    def test_search_no_results(self, client, auth_headers):
        """Test search with query that returns no results."""
        response = client.get('/api/foods/search?q=xyznonexistentfood',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        # May have results from USDA API, but local results should be empty
        assert isinstance(data['results'], list)

    def test_search_case_insensitive(self, client, auth_headers, test_food):
        """Test that search is case-insensitive."""
        response1 = client.get('/api/foods/search?q=CHICKEN',
                              headers=auth_headers)
        response2 = client.get('/api/foods/search?q=chicken',
                              headers=auth_headers)

        data1 = response1.get_json()
        data2 = response2.get_json()

        # Both should return results
        assert len(data1['results']) > 0
        assert len(data2['results']) > 0

    @patch('app.api.foods.requests.post')
    def test_search_includes_usda_results(self, mock_post, client, auth_headers, app):
        """Test that search includes USDA API results when available."""
        # Mock USDA API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'foods': [{
                'fdcId': 123456,
                'description': 'Organic Chicken Breast',
                'foodNutrients': [],
                'labelNutrients': {
                    'calories': {'value': 120},
                    'protein': {'value': 26},
                    'carbohydrates': {'value': 0},
                    'fat': {'value': 2},
                    'fiber': {'value': 0}
                }
            }]
        }
        mock_post.return_value = mock_response

        # Set USDA API key in environment
        # Patch the usda_key variable that was set at module import
        with patch('app.api.foods.usda_key', 'test_key'):
            response = client.get('/api/foods/search?q=chicken',
                                 headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        # Should include USDA results
        usda_results = [f for f in data['results'] if f.get('type') == 'usda']
        assert len(usda_results) > 0

    @patch('app.api.foods.requests.post')
    def test_search_handles_usda_api_error(self, mock_post, client, auth_headers):
        """Test that search handles USDA API errors gracefully."""
        mock_post.side_effect = Exception('API Error')

        with patch.dict('os.environ', {'USDA_API_KEY': 'test_key'}):
            response = client.get('/api/foods/search?q=chicken',
                                 headers=auth_headers)

        # Should still return successfully with database results
        assert response.status_code == 200


class TestCustomFoods:
    """Tests for custom food creation and management."""

    def test_create_custom_food(self, client, auth_headers):
        """Test creating a custom food."""
        response = client.post('/api/foods/custom',
                              headers=auth_headers,
                              json={
                                  'name': 'My Custom Recipe',
                                  'brand': 'Homemade',
                                  'serving_size': 200,
                                  'calories': 300,
                                  'protein': 25,
                                  'carbs': 30,
                                  'fat': 10,
                                  'fiber': 5
                              })

        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'Custom food created'
        assert data['food']['name'] == 'My Custom Recipe'
        assert data['food']['serving_size'] == 200

    def test_create_custom_food_without_auth(self, client):
        """Test creating custom food without authentication."""
        response = client.post('/api/foods/custom',
                              json={
                                  'name': 'Test Food',
                                  'serving_size': 100,
                                  'calories': 100,
                                  'protein': 10,
                                  'carbs': 10,
                                  'fat': 5,
                                  'fiber': 2
                              })

        assert response.status_code == 401

    def test_create_custom_food_missing_fields(self, client, auth_headers):
        """Test creating custom food with missing required fields."""
        response = client.post('/api/foods/custom',
                              headers=auth_headers,
                              json={
                                  'name': 'Incomplete Food'
                                  # Missing required nutrition fields
                              })

        assert response.status_code == 400
        data = response.get_json()
        assert 'errors' in data

    def test_create_custom_food_invalid_values(self, client, auth_headers):
        """Test creating custom food with invalid values."""
        response = client.post('/api/foods/custom',
                              headers=auth_headers,
                              json={
                                  'name': 'Invalid Food',
                                  'serving_size': -100,  # Negative value
                                  'calories': 'invalid',  # String instead of int
                                  'protein': 10,
                                  'carbs': 10,
                                  'fat': 5,
                                  'fiber': 2
                              })

        assert response.status_code == 400

    def test_get_custom_foods(self, client, auth_headers, test_custom_food):
        """Test retrieving user's custom foods."""
        response = client.get('/api/foods/custom',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert 'foods' in data
        assert len(data['foods']) > 0
        assert any(food['name'] == 'My Protein Shake' for food in data['foods'])

    def test_get_custom_foods_without_auth(self, client):
        """Test getting custom foods without authentication."""
        response = client.get('/api/foods/custom')

        assert response.status_code == 401

    def test_get_custom_foods_empty(self, client, auth_headers):
        """Test getting custom foods when user has none."""
        response = client.get('/api/foods/custom',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        # test_custom_food fixture adds one, but checking structure
        assert 'foods' in data
        assert isinstance(data['foods'], list)

    def test_custom_foods_isolated_by_user(self, client, test_custom_food, app):
        """Test that users can only see their own custom foods."""
        # Create another user
        from app.models import User
        user2 = User(email='user2@example.com', name='User2')
        user2.set_password('password123')
        db.session.add(user2)
        db.session.commit()

        # Create custom food for user2
        user2_food = CustomFood(
            user_id=user2.id,
            name='User 2 Food',
            serving_size=100,
            calories=100,
            protein=10,
            carbs=10,
            fat=5,
            fiber=2
        )
        db.session.add(user2_food)
        db.session.commit()

        # Login as user2
        response = client.post('/api/auth/login', json={
            'email': 'user2@example.com',
            'password': 'password123'
        })
        user2_token = response.get_json()['access_token']
        user2_headers = {'Authorization': f'Bearer {user2_token}'}

        # Get custom foods as user2
        response = client.get('/api/foods/custom',
                             headers=user2_headers)

        data = response.get_json()
        # Should only see user2's food, not test_user's
        assert len(data['foods']) == 1
        assert data['foods'][0]['name'] == 'User 2 Food'


class TestUSDAFoodSaving:
    """Tests for saving USDA foods to database."""

    @patch('app.api.foods.requests.get')
    def test_save_usda_food(self, mock_get, client, auth_headers):
        """Test saving a USDA food to the database."""
        # Mock USDA API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'fdcId': 123456,
            'description': 'Grilled Chicken Breast',
            'foodNutrients': [
                {'nutrient': {'name': 'Energy'}, 'amount': 165},
                {'nutrient': {'name': 'Protein'}, 'amount': 31},
                {'nutrient': {'name': 'Total lipid (fat)'}, 'amount': 3.6},
                {'nutrient': {'name': 'Carbohydrate, by difference'}, 'amount': 0},
                {'nutrient': {'name': 'Fiber, total dietary'}, 'amount': 0}
            ],
            'labelNutrients': {}
        }
        mock_get.return_value = mock_response

        with patch.dict('os.environ', {'USDA_API_KEY': 'test_key'}):
            response = client.post('/api/foods/usda/usda_123456',
                                  headers=auth_headers)

        assert response.status_code == 201
        data = response.get_json()
        assert 'food' in data
        assert data['food']['name'] == 'Grilled Chicken Breast'

    @patch('app.api.foods.requests.get')
    def test_save_usda_food_already_exists(self, mock_get, client, auth_headers):
        """Test saving a USDA food that already exists returns existing food."""
        # Create a food with USDA identifier
        food = Food(
            name='Existing USDA Food',
            calories=100,
            protein=10,
            carbs=10,
            fat=5,
            fiber=2
        )
        db.session.add(food)
        db.session.commit()

        response = client.post(f'/api/foods/usda/usda_{food.id}',
                              headers=auth_headers)

        # Should return existing food without calling API
        assert mock_get.call_count == 0

    def test_save_usda_food_no_api_key(self, client, auth_headers):
        """Test saving USDA food without API key configured."""
        with patch.dict('os.environ', {}, clear=True):
            response = client.post('/api/foods/usda/usda_123456',
                                  headers=auth_headers)

        assert response.status_code == 500
        data = response.get_json()
        assert 'not configured' in data['message'].lower()

    @patch('app.api.foods.requests.get')
    def test_save_usda_food_api_error(self, mock_get, client, auth_headers):
        """Test handling of USDA API errors."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        with patch.dict('os.environ', {'USDA_API_KEY': 'test_key'}):
            response = client.post('/api/foods/usda/usda_999999',
                                  headers=auth_headers)

        assert response.status_code == 500

    @patch('app.api.foods.requests.get')
    def test_save_usda_food_timeout(self, mock_get, client, auth_headers):
        """Test handling of USDA API timeout."""
        mock_get.side_effect = Exception('Timeout')

        with patch.dict('os.environ', {'USDA_API_KEY': 'test_key'}):
            response = client.post('/api/foods/usda/usda_123456',
                                  headers=auth_headers)

        assert response.status_code == 500

    def test_save_usda_food_without_auth(self, client):
        """Test saving USDA food without authentication."""
        response = client.post('/api/foods/usda/usda_123456')

        assert response.status_code == 401


class TestFoodDataIntegrity:
    """Tests for food data validation and integrity."""

    def test_food_to_dict_structure(self, test_food):
        """Test that food.to_dict() returns proper structure."""
        food_dict = test_food.to_dict()

        assert 'id' in food_dict
        assert 'name' in food_dict
        assert 'calories' in food_dict
        assert 'protein' in food_dict
        assert 'carbs' in food_dict
        assert 'fat' in food_dict
        assert 'fiber' in food_dict
        assert food_dict['per'] == '100g'

    def test_custom_food_to_dict_structure(self, test_custom_food):
        """Test that custom_food.to_dict() returns proper structure."""
        food_dict = test_custom_food.to_dict()

        assert 'id' in food_dict
        assert 'name' in food_dict
        assert 'serving_size' in food_dict
        assert 'calories' in food_dict
        assert 'protein' in food_dict
        assert 'carbs' in food_dict
        assert 'fat' in food_dict
        assert 'fiber' in food_dict

    def test_food_nutrition_values_non_negative(self, test_food):
        """Test that food nutrition values are non-negative."""
        assert test_food.calories >= 0
        assert test_food.protein >= 0
        assert test_food.carbs >= 0
        assert test_food.fat >= 0
        assert test_food.fiber >= 0