from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError, pre_load, post_load
from marshmallow.decorators import post_dump
from app import ma
import re
from datetime import datetime, date, timedelta


class UserRegistrationSchema(ma.Schema):    
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format"
        }
    )
    
    username = fields.Str(
        required=True,
        validate=[
            validate.Length(
                min=3, 
                max=30, 
                error="Username must be between 3 and 30 characters"
            ),
            validate.Regexp(
                r'^[a-zA-Z0-9_]+$', 
                error="Username can only contain letters, numbers, and underscores"
            )
        ]
    )
    
    password = fields.Str(
        required=True,
        validate=[
            validate.Length(
                min=8, 
                max=128, 
                error="Password must be between 8 and 128 characters"
            )
        ]
    )
    
    confirm_password = fields.Str(required=True)
    
    daily_calories = fields.Float(
        missing=2000,
        validate=validate.Range(
            min=1200, 
            max=5000,
            error="Daily calories must be between 1200 and 5000"
        )
    )
    
    daily_protein = fields.Float(
        missing=50,
        validate=validate.Range(
            min=20, 
            max=300,
            error="Daily protein must be between 20 and 300g"
        )
    )
    
    daily_carbs = fields.Float(
        missing=275,
        validate=validate.Range(
            min=50, 
            max=500,
            error="Daily carbs must be between 50 and 500g"
        )
    )
    
    daily_fat = fields.Float(
        missing=78,
        validate=validate.Range(
            min=20, 
            max=200,
            error="Daily fat must be between 20 and 200g"
        )
    )
    
    daily_fiber = fields.Float(
        missing=28,
        validate=validate.Range(
            min=10, 
            max=50,
            error="Daily fiber must be between 10 and 50g"
        )
    )
    
    @validates('email')
    def validate_email_domain(self, value):
        blocked_domains = ['tempmail.com', 'throwaway.email']
        domain = value.split('@')[1].lower()
        if domain in blocked_domains:
            raise ValidationError("Please use a valid email address")
        return value
    
    @validates('username')
    def validate_username_reserved(self, value):
        reserved = ['admin', 'root', 'api', 'test', 'user']
        if value.lower() in reserved:
            raise ValidationError("This username is reserved")
        return value
    
    @validates('password')
    def validate_password_strength(self, value):
        errors = []
        
        if not re.search(r'[A-Z]', value):
            errors.append("Must contain at least one uppercase letter")
        if not re.search(r'[a-z]', value):
            errors.append("Must contain at least one lowercase letter")
        if not re.search(r'\d', value):
            errors.append("Must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            errors.append("Must contain at least one special character")
        
        common_passwords = ['password', '12345678', 'qwerty', 'abc123']
        if value.lower() in common_passwords:
            errors.append("This password is too common")
        
        if errors:
            raise ValidationError(errors)
        
        return value
    
    @validates_schema
    def validate_passwords_match(self, data, **kwargs):
        password = data.get('password')
        confirm = data.get('confirm_password')
        
        if password != confirm:
            raise ValidationError("Passwords do not match", field_name="confirm_password")
    
    @validates_schema
    def validate_macro_goals(self, data, **kwargs):
        calories = data.get('daily_calories', 2000)
        protein = data.get('daily_protein', 50)
        carbs = data.get('daily_carbs', 275)
        fat = data.get('daily_fat', 78)
        
        calculated_calories = (protein * 4) + (carbs * 4) + (fat * 9)
        
        # Allow 15% variance
        min_calories = calculated_calories * 0.85
        max_calories = calculated_calories * 1.15
        
        if not (min_calories <= calories <= max_calories):
            raise ValidationError(
                f"Calories ({calories}) don't match macros (expected ~{calculated_calories:.0f})",
                field_name="daily_calories"
            )
    
    @post_load
    def clean_data(self, data, **kwargs):
        """Clean and prepare data after validation"""
        data.pop('confirm_password', None)
        
        for field in ['daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat', 'daily_fiber']:
            if field in data:
                data[field] = round(data[field], 1)
        
        return data


class UserLoginSchema(ma.Schema):
    
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required"}
    )
    
    password = fields.Str(
        required=True,
        error_messages={"required": "Password is required"}
    )
    
    @validates('email')
    def validate_email_lowercase(self, value):
        return value.lower()


class GoalsUpdateSchema(ma.Schema):
    
    daily_calories = fields.Float(
        validate=validate.Range(min=1200, max=5000)
    )
    daily_protein = fields.Float(
        validate=validate.Range(min=20, max=300)
    )
    daily_carbs = fields.Float(
        validate=validate.Range(min=50, max=500)
    )
    daily_fat = fields.Float(
        validate=validate.Range(min=20, max=200)
    )
    daily_fiber = fields.Float(
        validate=validate.Range(min=10, max=50)
    )
    
    @validates_schema
    def validate_at_least_one_field(self, data, **kwargs):
        if not data:
            raise ValidationError("At least one field must be provided")




class CustomFoodSchema(ma.Schema):
    
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(
                min=2, 
                max=100,
                error="Food name must be between 2 and 100 characters"
            )
        ]
    )
    
    brand = fields.Str(
        missing=None,
        validate=validate.Length(max=50)
    )
    
    serving_size = fields.Float(
        required=True,
        validate=validate.Range(
            min=1, 
            max=2000,
            error="Serving size must be between 1 and 2000g"
        )
    )
    
    calories = fields.Float(
        required=True,
        validate=validate.Range(
            min=0, 
            max=5000,
            error="Calories must be between 0 and 5000"
        )
    )
    
    protein = fields.Float(
        required=True,
        validate=validate.Range(
            min=0, 
            max=500,
            error="Protein must be between 0 and 500g"
        )
    )
    
    carbs = fields.Float(
        required=True,
        validate=validate.Range(
            min=0, 
            max=500,
            error="Carbs must be between 0 and 500g"
        )
    )
    
    fat = fields.Float(
        required=True,
        validate=validate.Range(
            min=0, 
            max=500,
            error="Fat must be between 0 and 500g"
        )
    )
    
    fiber = fields.Float(
        missing=0,
        validate=validate.Range(
            min=0, 
            max=100,
            error="Fiber must be between 0 and 100g"
        )
    )
    
    sugar = fields.Float(
        missing=None,
        validate=validate.Range(min=0, max=500)
    )
    
    sodium = fields.Float(
        missing=None,
        validate=validate.Range(min=0, max=10000)
    )
    
    @validates('name')
    def validate_food_name(self, value):
        if re.search(r'[<>\"\'%;()&+]', value):
            raise ValidationError("Food name contains invalid characters")
        return value.strip()
    
    @validates_schema
    def validate_macros_to_calories(self, data, **kwargs):
        protein = data.get('protein', 0)
        carbs = data.get('carbs', 0)
        fat = data.get('fat', 0)
        fiber = data.get('fiber', 0)
        calories = data.get('calories', 0)
        
        # Calculate expected calories (fiber counted as carbs but less caloric)
        calculated = (protein * 4) + (carbs * 4) + (fat * 9) - (fiber * 2)
        
        # Allow 20% variance for rounding
        min_cal = calculated * 0.8
        max_cal = calculated * 1.2
        
        if not (min_cal <= calories <= max_cal):
            raise ValidationError(
                f"Nutrition values don't match. Calories: {calories}, "
                f"Expected from macros: {calculated:.0f}"
            )
    
    @validates_schema
    def validate_sugar_vs_carbs(self, data, **kwargs):
        sugar = data.get('sugar', 0)
        carbs = data.get('carbs', 0)
        
        if sugar and sugar > carbs:
            raise ValidationError(
                "Sugar cannot exceed total carbohydrates",
                field_name="sugar"
            )
    
    @post_load
    def round_values(self, data, **kwargs):
        numeric_fields = ['serving_size', 'calories', 'protein', 'carbs', 
                         'fat', 'fiber', 'sugar', 'sodium']
        for field in numeric_fields:
            if field in data and data[field] is not None:
                data[field] = round(data[field], 1)
        return data


class FoodSearchSchema(ma.Schema):
    
    query = fields.Str(
        required=True,
        validate=[
            validate.Length(
                min=2, 
                max=100,
                error="Search query must be between 2 and 100 characters"
            )
        ]
    )
    
    limit = fields.Int(
        missing=10,
        validate=validate.Range(
            min=1, 
            max=50,
            error="Limit must be between 1 and 50"
        )
    )
    
    @validates('query')
    def sanitize_query(self, value):
        sanitized = re.sub(r'[^\w\s-]', '', value)
        return sanitized.strip()




class FoodEntrySchema(ma.Schema):
    
    food_id = fields.Int(required=False, allow_none=True)
    custom_food_id = fields.Int(required=False, allow_none=True)

    meal_type = fields.Str(
        required=True,
        validate=validate.OneOf(
            ['breakfast', 'lunch', 'dinner', 'snacks'],
            error="Invalid meal type"
        )
    )
    
    quantity = fields.Float(
        required=True,
        validate=validate.Range(
            min=0.1, 
            max=5000,
            error="Quantity must be between 0.1 and 5000g"
        )
    )
    
    @post_load
    def convert_date(self, data, **kwargs):
        if 'date' in data and isinstance(data['date'], str):
            try:
                data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                raise ValidationError('Date must be in YYYY-MM-DD format', field_name='date')
        return data
    
    notes = fields.Str(
        missing=None,
        validate=validate.Length(max=500)
    )
    
    @validates_schema
    def validate_food_reference(self, data, **kwargs):
        food_id = data.get('food_id')
        custom_food_id = data.get('custom_food_id')
        
        if not food_id and not custom_food_id:
            raise ValidationError("Either food_id or custom_food_id must be provided")
        
        if food_id and custom_food_id:
            raise ValidationError("Only one of food_id or custom_food_id should be provided")
    
    @validates('date')
    def validate_date_range(self, value):
        if isinstance(value, str):
            try:
                parsed_date = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise ValidationError("Date must be in YYYY-MM-DD format")
        else:
            parsed_date = value
        
        today = date.today()
        
        min_date = today - timedelta(days=30)
        if parsed_date < min_date:
            raise ValidationError("Cannot add entries more than 30 days in the past")
        
        max_date = today + timedelta(days=7)
        if parsed_date > max_date:
            raise ValidationError("Cannot add entries more than 7 days in the future")
        
        return value
        
    @post_load
    def convert_date(self, data, **kwargs):
        if 'date' in data and isinstance(data['date'], str):
            data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
        return data


class FoodEntryUpdateSchema(ma.Schema):    
    quantity = fields.Float(
        validate=validate.Range(min=0.1, max=5000)
    )
    
    meal_type = fields.Str(
        validate=validate.OneOf(['breakfast', 'lunch', 'dinner', 'snacks'])
    )
    
    notes = fields.Str(
        validate=validate.Length(max=500)
    )
    
    @validates_schema
    def validate_at_least_one_field(self, data, **kwargs):
        if not data:
            raise ValidationError("At least one field must be provided for update")


class SavedMealSchema(ma.Schema):
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(
                min=2, 
                max=100,
                error="Meal name must be between 2 and 100 characters"
            )
        ]
    )
    
    description = fields.Str(
        missing=None,
        validate=validate.Length(max=500)
    )
    
    foods = fields.List(
        fields.Dict(),
        required=True,
        validate=validate.Length(
            min=1,
            error="At least one food item is required"
        )
    )
    
    @validates('foods')
    def validate_food_items(self, value):
        for idx, food in enumerate(value):
            if 'food_id' not in food and 'custom_food_id' not in food:
                raise ValidationError(
                    f"Food item {idx + 1}: Must have food_id or custom_food_id"
                )
            
            if 'quantity' not in food:
                raise ValidationError(
                    f"Food item {idx + 1}: Quantity is required"
                )
            
            quantity = food.get('quantity', 0)
            if not isinstance(quantity, (int, float)) or quantity <= 0:
                raise ValidationError(
                    f"Food item {idx + 1}: Quantity must be a positive number"
                )
            
            if quantity > 5000:
                raise ValidationError(
                    f"Food item {idx + 1}: Quantity cannot exceed 5000g"
                )
        
        return value
    
    @validates('name')
    def sanitize_name(self, value):
        cleaned = re.sub(r'<[^>]*>', '', value)
        return cleaned.strip()



class RecipeImportSchema(ma.Schema):
    
    url = fields.Url(
        required=True,
        error_messages={
            "required": "Recipe URL is required",
            "invalid": "Invalid URL format"
        }
    )
    
    servings = fields.Int(
        missing=None,
        validate=validate.Range(
            min=1, 
            max=50,
            error="Servings must be between 1 and 50"
        )
    )
    
    @validates('url')
    def validate_recipe_url(self, value):
        supported_domains = [
            'allrecipes.com',
            'foodnetwork.com',
            'bonappetit.com',
            'seriouseats.com',
            'epicurious.com',
            'delish.com',
            'tasty.co',
            'cookinglight.com',
            'myfitnesspal.com',
            'bbcgoodfood.com',
            'simplyrecipes.com'
        ]
        
        from urllib.parse import urlparse
        domain = urlparse(value).netloc.replace('www.', '')
        
        return value


class RecipeCreateSchema(ma.Schema):
    
    name = fields.Str(
        required=True,
        validate=validate.Length(
            min=2, 
            max=200,
            error="Recipe name must be between 2 and 200 characters"
        )
    )
    
    ingredients = fields.List(
        fields.Dict(),
        required=True,
        validate=validate.Length(
            min=1,
            error="At least one ingredient is required"
        )
    )
    
    servings = fields.Int(
        required=True,
        validate=validate.Range(
            min=1, 
            max=50,
            error="Servings must be between 1 and 50"
        )
    )
    
    instructions = fields.Str(
        validate=validate.Length(max=5000)
    )
    
    prep_time = fields.Int(
        validate=validate.Range(
            min=0, 
            max=1440,
            error="Prep time must be between 0 and 1440 minutes (24 hours)"
        )
    )
    
    cook_time = fields.Int(
        validate=validate.Range(
            min=0, 
            max=1440,
            error="Cook time must be between 0 and 1440 minutes (24 hours)"
        )
    )
    
    @validates('ingredients')
    def validate_ingredients(self, value):
        for idx, ingredient in enumerate(value):
            if 'name' not in ingredient:
                raise ValidationError(f"Ingredient {idx + 1}: Name is required")
            
            if 'quantity' not in ingredient:
                raise ValidationError(f"Ingredient {idx + 1}: Quantity is required")
            
            if 'unit' not in ingredient:
                raise ValidationError(f"Ingredient {idx + 1}: Unit is required")
            
            # Validate units
            valid_units = ['g', 'kg', 'ml', 'l', 'cup', 'cups', 'tbsp', 
                          'tsp', 'oz', 'lb', 'piece', 'pieces']
            if ingredient['unit'] not in valid_units:
                raise ValidationError(
                    f"Ingredient {idx + 1}: Invalid unit '{ingredient['unit']}'"
                )
        
        return value


class DateRangeSchema(ma.Schema):
    
    start_date = fields.Date(
        required=True,
        format='%Y-%m-%d'
    )
    
    end_date = fields.Date(
        required=True,
        format='%Y-%m-%d'
    )
    
    @validates_schema
    def validate_date_range(self, data, **kwargs):
        start = data.get('start_date')
        end = data.get('end_date')
        
        if start > end:
            raise ValidationError("Start date must be before end date")
        
        # Maximum 90 days range
        if (end - start).days > 90:
            raise ValidationError("Date range cannot exceed 90 days")


class PaginationSchema(ma.Schema):
    
    page = fields.Int(
        missing=1,
        validate=validate.Range(min=1)
    )
    
    per_page = fields.Int(
        missing=20,
        validate=validate.Range(min=1, max=100)
    )
    
    sort_by = fields.Str(
        missing='created_at',
        validate=validate.OneOf(['created_at', 'name', 'calories'])
    )
    
    sort_order = fields.Str(
        missing='desc',
        validate=validate.OneOf(['asc', 'desc'])
    )

class CustomValidators:
    
    @staticmethod
    def validate_barcode(barcode):
        if not barcode:
            return True
        
        barcode = re.sub(r'[\s-]', '', barcode)
        
        if not barcode.isdigit():
            return False
        
        if len(barcode) not in [8, 12, 13]:
            return False
        
        if len(barcode) == 13:
            checksum = sum(
                int(digit) * (3 if i % 2 else 1) 
                for i, digit in enumerate(barcode[:-1])
            )
            return (10 - (checksum % 10)) % 10 == int(barcode[-1])
        
        return True
    
    @staticmethod
    def sanitize_html(text):
        if not text:
            return text
        
        text = re.sub(r'<[^>]*>', '', text)
        
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
        
        text = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', text)
        
        return text.strip()
    
    @staticmethod
    def validate_image_url(url):
        if not url:
            return True
        
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        return any(url.lower().endswith(ext) for ext in valid_extensions)


class ErrorResponseSchema(ma.Schema):
    
    message = fields.Str(required=True)
    errors = fields.Dict(missing={})
    code = fields.Int(missing=400)
    
    class Meta:
        ordered = True