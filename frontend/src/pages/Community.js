import React, { useState, useEffect } from 'react';
import communityService from '../services/community';
import RecipeCard from '../components/Community/RecipeCard';
import useApi from '../hooks/useApi';
import './Pages.css';
import '../components/Community/Community.css';

const Community = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { execute: fetchRecipes, loading } = useApi(communityService.getRecipes);

  useEffect(() => {
    loadRecipes();
  }, [currentPage, searchQuery]);

  const loadRecipes = async () => {
    const result = await fetchRecipes(currentPage, searchQuery);
    if (result.success) {
      setRecipes(result.data.recipes || []);
      setTotalPages(result.data.pages || 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRecipes();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Community Recipes</h1>
        <p className="page-subtitle">Discover and share delicious meal ideas</p>
      </div>

      <div className="community-search">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <p>No recipes found. Be the first to share!</p>
        </div>
      ) : (
        <>
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Community;