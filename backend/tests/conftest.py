import pytest
from datetime import date
from app import create_app, db
from app.models import User, Food, CustomFood, FoodEntry


@pytest.fixture(scope='function')
def app():
    """Create and configure a test app instance."""
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture(scope='function')
def runner(app):
    """Create a test CLI runner for the app."""
    return app.test_cli_runner()


@pytest.fixture(scope='function')
def test_user(app):
    """Create a test user in the database."""
    user = User(
        email='test@example.com',
        name='TestUser'
    )
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture(scope='function')
def auth_headers(client, test_user):
    """Get authentication headers for a test user."""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    data = response.get_json()
    access_token = data['access_token']
    return {'Authorization': f'Bearer {access_token}'}


@pytest.fixture(scope='function')
def test_food(app):
    """Create a test food in the database."""
    food = Food(
        name='Chicken Breast',
        brand='Generic',
        calories=165,
        protein=31,
        carbs=0,
        fat=4,
        fiber=0
    )
    db.session.add(food)
    db.session.commit()
    return food


@pytest.fixture(scope='function')
def test_custom_food(app, test_user):
    """Create a test custom food in the database."""
    custom_food = CustomFood(
        user_id=test_user.id,
        name='My Protein Shake',
        brand='Homemade',
        serving_size=250,
        calories=200,
        protein=30,
        carbs=10,
        fat=5,
        fiber=2
    )
    db.session.add(custom_food)
    db.session.commit()
    return custom_food


@pytest.fixture(scope='function')
def test_entry(app, test_user, test_food):
    """Create a test food entry in the database."""
    entry = FoodEntry(
        user_id=test_user.id,
        food_id=test_food.id,
        date=date.today(),
        meal_type='breakfast',
        quantity=200,
        calories=330,  # 165 * 2
        protein=62,    # 31 * 2
        carbs=0,
        fat=8,         # 4 * 2
        fiber=0
    )
    db.session.add(entry)
    db.session.commit()
    return entry