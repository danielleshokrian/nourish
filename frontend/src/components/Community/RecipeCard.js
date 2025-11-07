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
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
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