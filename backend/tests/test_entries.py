import pytest
from datetime import date, datetime
from app.models import FoodEntry
from app import db


class TestCreateEntry:
    """Tests for creating food entries."""

    def test_create_entry_with_standard_food(self, client, auth_headers, test_food):
        """Test creating an entry with a standard food from database."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'food_id': test_food.id,
                                  'date': '2025-11-05',
                                  'meal_type': 'lunch',
                                  'quantity': 150
                              })

        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'Entry created'
        assert data['entry']['food_id'] == test_food.id
        assert data['entry']['quantity'] == 150
        assert data['entry']['meal_type'] == 'lunch'

        # Verify nutrition calculation (150g of food with 165 cal per 100g)
        expected_calories = 165 * 1.5
        assert abs(data['entry']['calories'] - expected_calories) < 1

    def test_create_entry_with_custom_food(self, client, auth_headers, test_custom_food):
        """Test creating an entry with a custom food."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'custom_food_id': test_custom_food.id,
                                  'date': '2025-11-05',
                                  'meal_type': 'breakfast',
                                  'quantity': 250  # Same as serving size
                              })

        assert response.status_code == 201
        data = response.get_json()
        assert data['entry']['custom_food_id'] == test_custom_food.id
        assert data['entry']['calories'] == test_custom_food.calories
        assert data['entry']['protein'] == test_custom_food.protein

    def test_create_entry_without_auth(self, client, test_food):
        """Test that creating entry without authentication fails."""
        response = client.post('/api/entries',
                              json={
                                  'food_id': test_food.id,
                                  'date': '2025-11-05',
                                  'meal_type': 'lunch',
                                  'quantity': 150
                              })

        assert response.status_code == 401

    def test_create_entry_missing_food_id(self, client, auth_headers):
        """Test creating entry without food_id or custom_food_id fails."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'date': '2025-11-05',
                                  'meal_type': 'lunch',
                                  'quantity': 150
                              })

        assert response.status_code == 400

    def test_create_entry_invalid_food_id(self, client, auth_headers):
        """Test creating entry with non-existent food_id."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'food_id': 99999,
                                  'date': '2025-11-05',
                                  'meal_type': 'lunch',
                                  'quantity': 150
                              })

        assert response.status_code == 404
        data = response.get_json()
        assert data['message'] == 'Food not found'

    def test_create_entry_invalid_date_format(self, client, auth_headers, test_food):
        """Test creating entry with invalid date format."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'food_id': test_food.id,
                                  'date': 'invalid-date',
                                  'meal_type': 'lunch',
                                  'quantity': 150
                              })

        assert response.status_code == 400

    def test_create_entry_invalid_meal_type(self, client, auth_headers, test_food):
        """Test creating entry with invalid meal type."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'food_id': test_food.id,
                                  'date': '2025-11-05',
                                  'meal_type': 'invalid_meal',
                                  'quantity': 150
                              })

        assert response.status_code == 400

    def test_create_entry_spoonacular_id_rejected(self, client, auth_headers):
        """Test that Spoonacular IDs (strings) are rejected by schema validation."""
        response = client.post('/api/entries',
                              headers=auth_headers,
                              json={
                                  'food_id': 'spoon_12345',
                                  'date': '2025-11-05',
                                  'meal_type': 'lunch',
                                  'quantity': 150
                              })

        assert response.status_code == 400
        data = response.get_json()
        # Schema validation rejects string food_id before route logic
        assert 'errors' in data
        assert 'food_id' in data['errors']


class TestGetEntries:
    """Tests for retrieving food entries."""

    def test_get_entries_for_date(self, client, auth_headers, test_entry):
        """Test retrieving entries for a specific date."""
        response = client.get(f'/api/entries?date=2025-11-05',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert 'breakfast' in data
        assert 'lunch' in data
        assert 'dinner' in data
        assert 'snacks' in data
        assert len(data['breakfast']) == 1

    def test_get_entries_without_date(self, client, auth_headers):
        """Test that getting entries without date parameter fails."""
        response = client.get('/api/entries',
                             headers=auth_headers)

        assert response.status_code == 400
        data = response.get_json()
        assert data['message'] == 'Date parameter required'

    def test_get_entries_invalid_date_format(self, client, auth_headers):
        """Test getting entries with invalid date format."""
        response = client.get('/api/entries?date=01-15-2024',
                             headers=auth_headers)

        assert response.status_code == 400
        data = response.get_json()
        assert 'Invalid date format' in data['message']

    def test_get_entries_without_auth(self, client):
        """Test getting entries without authentication fails."""
        response = client.get('/api/entries?date=2024-01-15')

        assert response.status_code == 401

    def test_get_entries_empty_day(self, client, auth_headers):
        """Test getting entries for a day with no entries."""
        response = client.get('/api/entries?date=2024-12-31',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['breakfast']) == 0
        assert len(data['lunch']) == 0
        assert len(data['dinner']) == 0
        assert len(data['snacks']) == 0


class TestUpdateEntry:
    """Tests for updating food entries."""

    def test_update_entry_quantity(self, client, auth_headers, test_entry, test_food):
        """Test updating entry quantity recalculates nutrition."""
        response = client.put(f'/api/entries/{test_entry.id}',
                             headers=auth_headers,
                             json={'quantity': 300})

        assert response.status_code == 200
        data = response.get_json()
        assert data['entry']['quantity'] == 300

        # Verify nutrition recalculation (300g of 165 cal per 100g food)
        expected_calories = 165 * 3
        assert abs(data['entry']['calories'] - expected_calories) < 1

    def test_update_nonexistent_entry(self, client, auth_headers):
        """Test updating non-existent entry."""
        response = client.put('/api/entries/99999',
                             headers=auth_headers,
                             json={'quantity': 300})

        assert response.status_code == 404

    def test_update_entry_invalid_quantity(self, client, auth_headers, test_entry):
        """Test updating entry with invalid quantity."""
        response = client.put(f'/api/entries/{test_entry.id}',
                             headers=auth_headers,
                             json={'quantity': -50})

        assert response.status_code == 400

    def test_update_entry_without_quantity(self, client, auth_headers, test_entry):
        """Test updating entry without quantity parameter."""
        response = client.put(f'/api/entries/{test_entry.id}',
                             headers=auth_headers,
                             json={})

        assert response.status_code == 400

    def test_update_other_users_entry(self, client, test_entry, app):
        """Test that users cannot update other users' entries."""
        # Create another user
        from app.models import User
        user2 = User(email='user2@example.com', name='User2')
        user2.set_password('password123')
        db.session.add(user2)
        db.session.commit()

        # Login as user2
        response = client.post('/api/auth/login', json={
            'email': 'user2@example.com',
            'password': 'password123'
        })
        user2_token = response.get_json()['access_token']
        user2_headers = {'Authorization': f'Bearer {user2_token}'}

        # Try to update user1's entry
        response = client.put(f'/api/entries/{test_entry.id}',
                             headers=user2_headers,
                             json={'quantity': 300})

        assert response.status_code == 404


class TestDeleteEntry:
    """Tests for deleting food entries."""

    def test_delete_entry(self, client, auth_headers, test_entry):
        """Test deleting an entry."""
        entry_id = test_entry.id
        response = client.delete(f'/api/entries/{entry_id}',
                                headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Entry deleted'

        # Verify entry is deleted from database
        entry = FoodEntry.query.get(entry_id)
        assert entry is None

    def test_delete_nonexistent_entry(self, client, auth_headers):
        """Test deleting non-existent entry."""
        response = client.delete('/api/entries/99999',
                                headers=auth_headers)

        assert response.status_code == 404

    def test_delete_entry_without_auth(self, client, test_entry):
        """Test deleting entry without authentication."""
        response = client.delete(f'/api/entries/{test_entry.id}')

        assert response.status_code == 401

    def test_delete_other_users_entry(self, client, test_entry, app):
        """Test that users cannot delete other users' entries."""
        from app.models import User
        user2 = User(email='user2@example.com', name='User2')
        user2.set_password('password123')
        db.session.add(user2)
        db.session.commit()

        response = client.post('/api/auth/login', json={
            'email': 'user2@example.com',
            'password': 'password123'
        })
        user2_token = response.get_json()['access_token']
        user2_headers = {'Authorization': f'Bearer {user2_token}'}

        response = client.delete(f'/api/entries/{test_entry.id}',
                                headers=user2_headers)

        assert response.status_code == 404


class TestClearMealEntries:
    """Tests for clearing all entries for a specific meal."""

    def test_clear_meal_entries(self, client, auth_headers, test_user, test_food):
        """Test clearing all entries for a specific meal."""
        # Create multiple entries for breakfast
        for i in range(3):
            entry = FoodEntry(
                user_id=test_user.id,
                food_id=test_food.id,
                date=date(2024, 1, 15),
                meal_type='breakfast',
                quantity=100,
                calories=165,
                protein=31,
                carbs=0,
                fat=4,
                fiber=0
            )
            db.session.add(entry)
        db.session.commit()

        response = client.delete('/api/entries/clear?date=2024-01-15&meal_type=breakfast',
                                headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] == 3

    def test_clear_meal_missing_parameters(self, client, auth_headers):
        """Test clearing meal without required parameters."""
        response = client.delete('/api/entries/clear?date=2024-01-15',
                                headers=auth_headers)

        assert response.status_code == 400

    def test_clear_meal_invalid_meal_type(self, client, auth_headers):
        """Test clearing with invalid meal type."""
        response = client.delete('/api/entries/clear?date=2024-01-15&meal_type=invalid',
                                headers=auth_headers)

        assert response.status_code == 400


class TestDailySummary:
    """Tests for daily nutrition summary."""

    def test_get_daily_summary(self, client, auth_headers, test_entry):
        """Test getting daily nutrition summary."""
        response = client.get(f'/api/summary/2025-11-05',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data['date'] == '2025-11-05'
        assert 'nutrients' in data
        assert 'calories' in data['nutrients']
        assert 'protein' in data['nutrients']
        assert 'consumed' in data['nutrients']['calories']
        assert 'goal' in data['nutrients']['calories']
        assert 'percentage' in data['nutrients']['calories']

    def test_daily_summary_invalid_date(self, client, auth_headers):
        """Test getting summary with invalid date."""
        response = client.get('/api/summary/invalid-date',
                             headers=auth_headers)

        assert response.status_code == 400

    def test_daily_summary_without_auth(self, client):
        """Test getting summary without authentication."""
        response = client.get('/api/summary/2024-01-15')

        assert response.status_code == 401

    def test_daily_summary_empty_day(self, client, auth_headers):
        """Test getting summary for day with no entries."""
        response = client.get('/api/summary/2024-12-31',
                             headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert data['nutrients']['calories']['consumed'] == 0