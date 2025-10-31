from app import create_app, db
from app.models import Food

app = create_app('development')

with app.app_context():
    foods = [
        Food(name='Chicken Breast', calories=165, protein=31, carbs=0, fat=3.6, fiber=0),
        Food(name='Brown Rice', calories=112, protein=2.6, carbs=24, fat=0.9, fiber=1.8),
        Food(name='Broccoli', calories=34, protein=2.8, carbs=7, fat=0.4, fiber=2.6),
        Food(name='Salmon', calories=208, protein=20, carbs=0, fat=13, fiber=0),
        Food(name='Sweet Potato', calories=86, protein=1.6, carbs=20, fat=0.1, fiber=3),
        Food(name='Eggs', calories=155, protein=13, carbs=1.1, fat=11, fiber=0),
        Food(name='Banana', calories=89, protein=1.1, carbs=23, fat=0.3, fiber=2.6),
        Food(name='Oats', calories=389, protein=17, carbs=66, fat=7, fiber=11),
        Food(name='Greek Yogurt', calories=59, protein=10, carbs=3.6, fat=0.4, fiber=0),
        Food(name='Almonds', calories=579, protein=21, carbs=22, fat=50, fiber=12.5),
    ]
    
    db.session.add_all(foods)
    db.session.commit()
    print(f"Added {len(foods)} foods to database")