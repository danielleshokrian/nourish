import pytest
from app.models import User
from app import db


class TestUserRegistration:
    """Tests for user registration endpoint."""

    def test_successful_registration(self, client):
        """Test successful user registration with valid data."""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@example.com',
            'name': 'NewUser',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!'
        })

        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'User created successfully'
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == 'newuser@example.com'
        assert data['user']['name'] == 'NewUser'
        assert 'password' not in data['user']

        # Verify user was created in database
        user = User.query.filter_by(email='newuser@example.com').first()
        assert user is not None
        assert user.name == 'NewUser'

    def test_registration_duplicate_email(self, client, test_user):
        """Test registration fails with duplicate email."""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',  # Already exists
            'name': 'AnotherUser',
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        })

        assert response.status_code == 409
        data = response.get_json()
        assert data['message'] == 'Email already registered'

    def test_registration_missing_fields(self, client):
        """Test registration fails with missing required fields."""
        response = client.post('/api/auth/register', json={
            'email': 'incomplete@example.com'
            # Missing name and password
        })

        assert response.status_code == 400
        data = response.get_json()
        assert 'errors' in data

    def test_registration_invalid_email(self, client):
        """Test registration fails with invalid email format."""
        response = client.post('/api/auth/register', json={
            'email': 'not-an-email',
            'name': 'Test User',
            'password': 'password123',
            'confirm_password': 'password123'
        })

        assert response.status_code == 400

    def test_registration_password_too_short(self, client):
        """Test registration fails with short password."""
        response = client.post('/api/auth/register', json={
            'email': 'test2@example.com',
            'name': 'Test User',
            'password': '123',
            'confirm_password': '123'
        })

        assert response.status_code == 400

    def test_registration_empty_name(self, client):
        """Test registration fails with empty name."""
        response = client.post('/api/auth/register', json={
            'email': 'test3@example.com',
            'name': '',
            'password': 'password123',
            'confirm_password': 'password123'
        })

        assert response.status_code == 400


class TestUserLogin:
    """Tests for user login endpoint."""

    def test_successful_login(self, client, test_user):
        """Test successful login with valid credentials."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == 'test@example.com'
        assert data['user']['name'] == 'TestUser'

    def test_login_wrong_password(self, client, test_user):
        """Test login fails with incorrect password."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })

        assert response.status_code == 401
        data = response.get_json()
        assert data['message'] == 'Invalid email or password'

    def test_login_nonexistent_user(self, client):
        """Test login fails with non-existent email."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })

        assert response.status_code == 401
        data = response.get_json()
        assert data['message'] == 'Invalid email or password'

    def test_login_missing_email(self, client):
        """Test login fails with missing email."""
        response = client.post('/api/auth/login', json={
            'password': 'password123'
        })

        assert response.status_code == 400

    def test_login_missing_password(self, client, test_user):
        """Test login fails with missing password."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com'
        })

        assert response.status_code == 400

    def test_login_empty_credentials(self, client):
        """Test login fails with empty credentials."""
        response = client.post('/api/auth/login', json={})

        assert response.status_code == 400

    def test_login_case_sensitive_email(self, client, test_user):
        """Test login with different email case."""
        response = client.post('/api/auth/login', json={
            'email': 'TEST@EXAMPLE.COM',
            'password': 'password123'
        })

        # This should fail unless email normalization is implemented
        assert response.status_code == 401


class TestPasswordSecurity:
    """Tests for password hashing and security."""

    def test_password_is_hashed(self, app, test_user):
        """Test that passwords are hashed, not stored in plaintext."""
        assert test_user.password_hash != 'password123'
        assert len(test_user.password_hash) > 20
        assert test_user.check_password('password123')

    def test_password_hash_different_for_same_password(self, app):
        """Test that same password produces different hashes."""
        user1 = User(email='user1@example.com', name='User 1')
        user1.set_password('samepassword')

        user2 = User(email='user2@example.com', name='User 2')
        user2.set_password('samepassword')

        assert user1.password_hash != user2.password_hash

    def test_check_password_method(self, test_user):
        """Test password checking method."""
        assert test_user.check_password('password123') is True
        assert test_user.check_password('wrongpassword') is False
        assert test_user.check_password('') is False


class TestJWTAuthentication:
    """Tests for JWT token authentication."""

    def test_access_token_works(self, client, auth_headers):
        """Test that access token allows authenticated access."""
        # Try to access a protected endpoint
        response = client.get('/api/foods/search?q=chicken',
                            headers=auth_headers)

        # Should not get 401 unauthorized
        assert response.status_code != 401

    def test_no_token_returns_unauthorized(self, client):
        """Test that accessing protected endpoint without token fails."""
        response = client.get('/api/foods/search?q=chicken')

        assert response.status_code == 401

    def test_invalid_token_returns_unauthorized(self, client):
        """Test that invalid token is rejected."""
        response = client.get('/api/foods/search?q=chicken',
                            headers={'Authorization': 'Bearer invalid-token'})

        assert response.status_code == 422  # JWT decode error

    def test_malformed_auth_header(self, client):
        """Test that malformed authorization header is rejected."""
        response = client.get('/api/foods/search?q=chicken',
                            headers={'Authorization': 'InvalidFormat'})

        assert response.status_code == 401