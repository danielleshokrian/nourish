from app import create_app, db
from app.models import User, Food, FoodEntry, CustomFood, SavedMeal
import os

# Use production config if FLASK_ENV is production

config_name = 'production' if os.environ.get('FLASK_ENV') == 'production' else 'development'

app = create_app(config_name)

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Food': Food}

@app.cli.command()
def init_db():
    db.create_all()
    print("Database initialized!")

@app.cli.command()
def seed_db():
    from app.models import Food
    
    foods = [
        Food(name='Chicken Breast', calories=165, protein=31, carbs=0, fat=3.6, fiber=0),
        Food(name='Brown Rice', calories=216, protein=5, carbs=45, fat=1.8, fiber=3.5),
        Food(name='Broccoli', calories=55, protein=3.7, carbs=11, fat=0.6, fiber=5.1),
        Food(name='Salmon', calories=208, protein=20, carbs=0, fat=13, fiber=0),
        Food(name='Greek Yogurt', calories=100, protein=17, carbs=6, fat=0.7, fiber=0),
    ]
    
    for food in foods:
        existing = Food.query.filter_by(name=food.name).first()
        if not existing:
            db.session.add(food)
    
    db.session.commit()
    print("Database seeded!")

@app.cli.command()
def create_demo_user():
    """Create or update the demo user account"""
    demo_email = 'demo@nourish.app'
    demo_password = 'Demo123!'
    demo_name = 'Demo User'

    demo_user = User.query.filter_by(email=demo_email).first()

    if demo_user:
        print("Demo user already exists, updating password...")
        demo_user.set_password(demo_password)
    else:
        print("Creating demo user...")
        demo_user = User(
            email=demo_email,
            name=demo_name
        )
        demo_user.set_password(demo_password)
        db.session.add(demo_user)

    db.session.commit()
    print(f"Demo user ready! Email: {demo_email}, Password: {demo_password}")

if __name__ == '__main__':
    app.run(debug=True, port=5001)