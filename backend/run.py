from app import create_app, db
from app.models import User, Food, FoodEntry, CustomFood, SavedMeal

app = create_app('development')

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Food': Food}

@app.cli.command()
def init_db():
    db.create_all()
    print("Database initialized!")

@app.cli.command()
def seed_db():
    """Seed the database with sample data."""
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)