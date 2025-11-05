import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import communityService from '../services/community';
import useApi from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import './Pages.css';
import '../components/Community/Community.css';

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);

  const { execute: fetchRecipe, loading } = useApi(communityService.getRecipe);
  const { execute: importRecipe, loading: importing } = useApi(communityService.importRecipe);
  const { execute: deleteRecipe } = useApi(communityService.deleteRecipe);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    const result = await fetchRecipe(recipeId);
    if (result.success) {
      setRecipe(result.data.recipe);
    }
  };

  const handleImport = async () => {
    const result = await importRecipe(recipeId);
    if (result.success) {
      alert('Recipe imported to your saved meals!');
      navigate('/saved-meals');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      const result = await deleteRecipe(recipeId);
      if (result.success) {
        alert('Recipe deleted');
        navigate('/community');
      }
    }
  };

  if (loading || !recipe) {
    return <div className="loading">Loading recipe...</div>;
  }

  const isOwner = user && user.id === recipe.user_id;

  return (
    <div className="page-container">
      <div className="recipe-detail">
        {recipe.image_url && (
          <div className="recipe-detail-image">
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="recipe-detail-header">
          <h1>{recipe.title}</h1>
          <p className="recipe-author">By {recipe.creator?.name}</p>
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}
        </div>

        <div className="recipe-nutrition">
          <h3>Nutrition Information</h3>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="label">Calories</span>
              <span className="value">{Math.round(recipe.total_calories)}</span>
            </div>
            <div className="nutrition-item">
              <span className="label">Protein</span>
              <span className="value">{recipe.total_protein.toFixed(1)}g</span>
            </div>
            <div className="nutrition-item">
              <span className="label">Carbs</span>
              <span className="value">{recipe.total_carbs.toFixed(1)}g</span>
            </div>
            <div className="nutrition-item">
              <span className="label">Fat</span>
              <span className="value">{recipe.total_fat.toFixed(1)}g</span>
            </div>
          </div>
        </div>

        <div className="recipe-ingredients">
          <h3>Ingredients</h3>
          <ul>
            {recipe.foods.map((food, idx) => (
              <li key={idx}>
                {food.name} - {food.quantity}g
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-instructions">
          <h3>Instructions</h3>
          <p className="instructions-text">{recipe.instructions}</p>
        </div>

        <div className="recipe-actions">
          {!isOwner && (
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Add to My Saved Meals'}
            </button>
          )}
          
          {isOwner && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete Recipe
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => navigate('/community')}
          >
            Back to Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
