# Nourish 

A comprehensive full-stack nutrition tracking and meal planning web application that helps users monitor their daily food intake, set personalized nutrition goals, and share recipes with a community.

##  Features

### Core Functionality
- **Daily Food Tracking**: Log meals by category (breakfast, lunch, dinner, snacks)
- **Comprehensive Food Database**: Search 900,000+ foods via USDA FoodData Central API
- **Custom Foods**: Create and manage custom foods not found in the database
- **Nutrition Analysis**: Real-time macro and micronutrient tracking with visual feedback

### Meal Planning
- **Saved Meals**: Create reusable meal templates with multiple foods
- **Quick Entry**: Apply saved meals to any date with one click
- **Meal Editing**: Update and modify saved meal compositions

### Community Features
- **Recipe Sharing**: Share your favorite meals with the community
- **Image Uploads**: Add photos to recipes (PNG, JPG, GIF, WebP)
- **Recipe Discovery**: Browse, search, and filter community recipes
- **Recipe Import**: Import community recipes to your saved meals

### Analytics & Goals
- **Customizable Goals**: Set personalized daily targets for calories, protein, carbs, fat, and fiber
- **Progress Tracking**: Monitor your nutrition trends over time
- **Visual Dashboard**: Charts and cards showing consumption vs. goals
- **Historical Data**: Review past entries and analyze patterns

## Tech Stack

### Frontend
- **React** 18.2.0 with React Router DOM for SPA navigation
- **Recharts** for data visualization
- **date-fns** for date manipulation
- **Heroicons** for UI icons
- Custom CSS with component-based styling

### Backend
- **Flask** 3.0.0 with Flask-RESTful
- **SQLAlchemy** 2.0.23 for ORM
- **Flask-JWT-Extended** for authentication
- **Marshmallow** for data validation and serialization
- **Flask-CORS** for cross-origin requests
- **Alembic** for database migrations

### Database
- **SQLite** (development)
- SQLAlchemy-compatible databases supported (PostgreSQL, MySQL)

### External APIs
- **USDA FoodData Central API** for nutrition data
- **OpenAI API** (optional integration)

## Prerequisites

- **Node.js** 14.x or higher
- **Python** 3.11 or higher
- **pip** and **venv** for Python package management
- **Git** for version control
- **USDA API Key** (free from [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html))

## Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nourish
   ```

2. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   FLASK_APP=run.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   DATABASE_URL=sqlite:///nutrition_tracker.db
   USDA_API_KEY=your-usda-api-key-here
   OPENAI_API_KEY=your-openai-api-key-here  # Optional
   FRONTEND_URL=http://localhost:3000
   ```

5. **Initialize the database**
   ```bash
   flask db upgrade
   # Or if using the init command:
   flask init-db
   ```

6. **Seed sample data (optional)**
   ```bash
   python seed_foods.py
   # Or using Flask CLI:
   flask seed-db
   ```

7. **Run the backend server**
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint (if needed)**

   The frontend is configured to proxy API requests to `http://localhost:5000` in development. Update `package.json` if your backend runs on a different port.

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | Flask secret key for session management | Yes |
| `JWT_SECRET_KEY` | Secret key for JWT token generation | Yes |
| `DATABASE_URL` | Database connection string | Yes |
| `USDA_API_KEY` | USDA FoodData Central API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

### Database Configuration

By default, the application uses SQLite. For production, configure a PostgreSQL or MySQL database:

```env
DATABASE_URL=postgresql://username:password@localhost/nourish
```

## 📖 Usage

### Getting Started

1. **Register an account** at `http://localhost:3000/register`
   - Email must be valid format
   - Password must include uppercase, lowercase, number, and special character

2. **Set your nutrition goals** in Settings
   - Customize daily targets for calories, protein, carbs, fat, and fiber

3. **Log your first meal**
   - Navigate to Dashboard
   - Click "Add Food" for any meal category
   - Search foods or create custom foods
   - Specify quantity consumed

4. **Create saved meals**
   - Go to "Saved Meals" page
   - Build meal templates with multiple foods
   - Apply saved meals to any date for quick logging

5. **Explore community recipes**
   - Browse shared recipes from other users
   - Import recipes to your saved meals
   - Share your own recipes with the community

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
Response: {
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### Food Management

#### Search Foods
```http
GET /api/foods/search?q=chicken
Authorization: Bearer <token>
```

#### Create Custom Food
```http
POST /api/foods/custom
Authorization: Bearer <token>
Content-Type: application/json
{
  "name": "My Custom Food",
  "serving_size": "100g",
  "calories": 200,
  "protein": 20.0,
  "carbs": 10.0,
  "fat": 5.0,
  "fiber": 3.0
}
```

### Food Entries

#### Log Food Entry
```http
POST /api/entries
Authorization: Bearer <token>
Content-Type: application/json
{
  "food_id": 123,
  "quantity": 150,
  "meal_type": "breakfast",
  "date": "2025-11-05"
}
```

#### Get Daily Summary
```http
GET /api/summary/2025-11-05
Authorization: Bearer <token>
Response: {
  "date": "2025-11-05",
  "totals": {
    "calories": 1850,
    "protein": 120,
    "carbs": 180,
    "fat": 65,
    "fiber": 30
  },
  "goals": { ... },
  "percentages": { ... }
}
```

### Saved Meals

#### Create Saved Meal
```http
POST /api/meals
Authorization: Bearer <token>
Content-Type: application/json
{
  "name": "Protein Breakfast",
  "foods": [
    {"food_id": 123, "quantity": 100},
    {"custom_food_id": 456, "quantity": 50}
  ]
}
```

#### Apply Saved Meal to Date
```http
POST /api/meals/<meal_id>/add
Authorization: Bearer <token>
Content-Type: application/json
{
  "date": "2025-11-05",
  "meal_type": "breakfast"
}
```

### Community Recipes

#### Share Recipe
```http
POST /api/community/recipes
Authorization: Bearer <token>
Content-Type: multipart/form-data
{
  "title": "Healthy Bowl",
  "description": "A nutritious meal",
  "instructions": "Step by step...",
  "foods": [{"food_id": 123, "quantity": 100}],
  "image": <file>
}
```

#### Get Community Recipes
```http
GET /api/community/recipes?page=1&per_page=10&search=chicken
Authorization: Bearer <token>
```

## Testing

### Backend Tests

Run the test suite:
```bash
cd backend
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

View coverage report:
```bash
open htmlcov/index.html
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📁 Project Structure

```
nourish/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── models.py             # Database models
│   │   ├── schemas.py            # Validation schemas
│   │   ├── auth/                 # Authentication routes
│   │   ├── api/                  # API endpoints
│   │   │   ├── foods.py
│   │   │   ├── entries.py
│   │   │   ├── meals.py
│   │   │   ├── users.py
│   │   │   └── community.py
│   │   └── utils/                # Utilities
│   ├── migrations/               # Database migrations
│   ├── tests/                    # Test suite
│   ├── config.py                 # Configuration
│   ├── run.py                    # Entry point
│   └── requirements.txt          # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Auth/
│   │   │   ├── Common/
│   │   │   ├── Dashboard/
│   │   │   ├── Layout/
│   │   │   ├── Meals/
│   │   │   └── Community/
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   └── App.js                # Main app
│   ├── public/                   # Static assets
│   └── package.json              # Dependencies
│
└── README.md                     # This file
```

## Database Models

- **User**: User accounts with customizable nutrition goals
- **Food**: Public food database with USDA data
- **CustomFood**: User-created custom foods
- **FoodEntry**: Daily food intake logs
- **SavedMeal**: Reusable meal templates
- **CommunityRecipe**: Shared recipes with images

## Security Features

- JWT-based authentication with access and refresh tokens
- Bcrypt password hashing
- Password strength validation
- HTML sanitization in user inputs
- CORS protection
- SQL injection prevention via ORM
- Input validation with Marshmallow schemas
- File upload size limits and type validation

## Development Workflow

### Database Migrations

Create a new migration:
```bash
flask db migrate -m "Description of changes"
```

Apply migrations:
```bash
flask db upgrade
```

Rollback migration:
```bash
flask db downgrade
```

### Code Style

- **Backend**: Follow PEP 8 guidelines
- **Frontend**: Use ESLint configuration
- **Commits**: Use conventional commit messages

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**Database connection errors**
```bash
# Reset database
flask db downgrade base
flask db upgrade
```

**USDA API errors**
- Verify your API key is valid
- Check API rate limits (not exceeded)
- Ensure internet connection

**JWT token errors**
- Clear browser local storage
- Re-login to get fresh tokens
- Verify JWT_SECRET_KEY is set

## Future Enhancements

- [ ] Barcode scanning for food entry
- [ ] Recipe calorie calculator
- [ ] Meal planning calendar
- [ ] Progress charts and analytics
- [ ] Social features (follow users, like recipes)
- [ ] Mobile app (React Native)
- [ ] AI-powered meal suggestions
- [ ] Export data to CSV/PDF
- [ ] Integration with fitness trackers
- [ ] Nutritionist mode with client management


## Acknowledgments

- **USDA FoodData Central** for comprehensive nutrition data
- **React** and **Flask** communities for excellent documentation
- All contributors and users of this application

## Contact

For questions, issues, or suggestions, please open an issue on GitHub.

---