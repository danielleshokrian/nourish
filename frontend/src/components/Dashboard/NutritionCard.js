import React from 'react';
import './Dashboard.css';

const NutritionCard = ({ nutrient, data }) => {
  const { consumed, goal, percentage } = data;
  
  const getColorClass = () => {
    if (percentage < 50) return 'low';
    if (percentage < 90) return 'medium';
    if (percentage <= 110) return 'good';
    return 'high';
  };

  const formatValue = (value) => {
    return Math.round(value);
  };

  const getNutrientUnit = (nutrient) => {
    if (nutrient === 'calories') return '';
    return 'g';
  };

  return (
    <div className={`nutrition-card ${getColorClass()}`}>
      <div className="nutrition-label">
        {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
      </div>
      <div className="nutrition-value">
        {formatValue(consumed)}
        <span className="nutrition-unit">{getNutrientUnit(nutrient)}</span>
      </div>
      <div className="nutrition-goal">
        of {formatValue(goal)}{getNutrientUnit(nutrient)}
      </div>
      <div className="nutrition-progress">
        <div 
          className="nutrition-progress-bar"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="nutrition-percentage">
        {formatValue(percentage)}%
      </div>
    </div>
  );
};

export default NutritionCard;
