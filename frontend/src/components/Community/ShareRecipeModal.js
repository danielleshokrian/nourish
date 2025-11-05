import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import communityService from '../../services/community';
import './ShareRecipeModal.css';

const ShareRecipeModal = ({ meal, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: meal.name,
    description: meal.description || '',
    instructions: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'Invalid file type. Use PNG, JPG, or GIF' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'File size must be less than 5MB' });
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.instructions.trim()) newErrors.instructions = 'Instructions are required';
    if (formData.instructions.length < 10) {
      newErrors.instructions = 'Instructions must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const recipeData = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        foods: meal.foods
      };

      await communityService.shareRecipe(recipeData, imageFile);
      
      alert('Recipe shared successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setErrors({ general: error.message || 'Failed to share recipe' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Recipe to Community</h2>
          <button className="share-close-btn" onClick={onClose} type="button">
            <XMarkIcon className="icon-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="share-modal-form">
          {errors.general && (
            <div className="share-error-message">{errors.general}</div>
          )}

          <div className="share-form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              maxLength={100}
            />
            {errors.title && <span className="share-field-error">{errors.title}</span>}
          </div>

          <div className="share-form-group">
            <label htmlFor="description">Short Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A quick summary of your recipe..."
              maxLength={500}
            />
          </div>

          <div className="share-form-group">
            <label htmlFor="instructions">Instructions *</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Describe how to prepare this meal..."
              rows={6}
              className={errors.instructions ? 'error' : ''}
              maxLength={5000}
            />
            {errors.instructions && <span className="share-field-error">{errors.instructions}</span>}
            <small className="share-field-hint">{formData.instructions.length}/5000 characters</small>
          </div>

          <div className="share-form-group">
            <label htmlFor="image">Recipe Image (optional)</label>
            <div className="share-image-upload">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image" className="share-image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="share-image-preview" />
                ) : (
                  <div className="share-image-placeholder">
                    <PhotoIcon className="icon-lg" />
                    <span>Click to upload image</span>
                    <small>PNG, JPG, GIF up to 5MB</small>
                  </div>
                )}
              </label>
            </div>
            {errors.image && <span className="share-field-error">{errors.image}</span>}
          </div>

          <div className="share-recipe-preview">
            <h4>Ingredients (from saved meal):</h4>
            <ul>
              {meal.foods.map((food, idx) => (
                <li key={idx}>{food.name} - {food.quantity}g</li>
              ))}
            </ul>
          </div>

          <div className="share-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sharing...' : 'Share to Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareRecipeModal;