import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Community.css';

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/community/${recipe.id}`);
  };

  return (
    <div className="recipe-card" onClick={handleClick}>
      <div className="recipe-image">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="recipe-placeholder">
            <span>🍽️</span>
          </div>
        )}
      </div>

      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        {recipe.description && (
          <p className="recipe-description">{recipe.description}</p>
        )}

        <div className="recipe-meta">
          <span className="recipe-author">By {recipe.creator?.name}</span>
        </div>

        <div className="recipe-nutrition-mini">
          <span>{Math.round(recipe.total_calories)} cal</span>
          <span>P: {recipe.total_protein.toFixed(0)}g</span>
          <span>C: {recipe.total_carbs.toFixed(0)}g</span>
          <span>F: {recipe.total_fat.toFixed(0)}g</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;