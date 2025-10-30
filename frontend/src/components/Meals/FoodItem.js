import React, { useState } from 'react';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import entryService from '../../services/entries';
import './MealCard.css';

const FoodItem = ({ entry, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Delete this food entry?')) {
      setIsDeleting(true);
      
      try {
        await entryService.deleteEntry(entry.id);
        onDelete(entry.id);
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="food-item">
      <div className="food-info">
        <span className="food-name">{entry.name}</span>
        <span className="food-quantity">{entry.quantity}g</span>
      </div>
      
      <div className="food-macros">
        <span className="food-calories">{Math.round(entry.calories)} cal</span>
        <span className="food-macro">P: {Math.round(entry.protein)}g</span>
        <span className="food-macro">C: {Math.round(entry.carbs)}g</span>
        <span className="food-macro">F: {Math.round(entry.fat)}g</span>
      </div>

      <div className="food-actions">
        <button 
          className="btn-icon"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete entry"
        >
          <TrashIcon className="icon-sm" />
        </button>
      </div>
    </div>
  );
};

export default FoodItem;