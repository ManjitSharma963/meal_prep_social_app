import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchRecipes, createRecipe, updateRecipe, deleteRecipe } from '../utils/api';
import { Clock, Star, Users, ChefHat, Plus, X, Save, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import '../styles/dish-library.css';
import '../styles/recipe-modal.css';
import '../styles/ingredient-form.css';

const DishLibrary = () => {
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isEditRecipeModalOpen, setIsEditRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Easy',
    category: 'Breakfast',
    tags: [],
    price: '',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    },
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [{ text: '', heat: '', temperature: '', time: '' }]
  });
  const [newTag, setNewTag] = useState('');
  const location = useLocation();

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Indian', 'Continental'];
  const formCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const heatLevels = ['Low', 'Medium', 'Medium-High', 'High', 'Room Temperature'];

  // Removed hardcoded sample data - using only API data

  // Handle search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Fetch recipes from API
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const data = await fetchRecipes(token);
        setRecipes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes. Please try again later.');
        // No fallback data - show error state
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [token]);

  // Form handling functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (field, value) => {
    setRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNutritionChange = (field, value) => {
    setRecipe(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value
      }
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const addStep = () => {
    setRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, { text: '', heat: '', temperature: '', time: '' }]
    }));
  };

  const removeStep = (index) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index, field, value) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    updateIngredient(index, field, value);
  };

  const handleStepChange = (index, field, value) => {
    updateStep(index, field, value);
  };

  const addTag = () => {
    if (newTag.trim() && !recipe.tags.includes(newTag.trim())) {
      setRecipe(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setRecipe(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecipe(recipe, token);
      
      // Refresh recipes list
      const updatedRecipes = await fetchRecipes(token);
      setRecipes(updatedRecipes);
      
      // Reset form
      setRecipe({
        title: '',
        description: '',
        image: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'Easy',
        category: 'Breakfast',
        tags: [],
        price: '',
        nutrition: {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: ''
        },
        ingredients: [{ name: '', quantity: '', unit: '' }],
        steps: [{ text: '', heat: '', temperature: '', time: '' }]
      });
      setIsAddRecipeModalOpen(false);
      alert('Recipe added successfully!');
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Error adding recipe. Please try again.');
    }
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    if (!editingRecipe) return;

    try {
      const updatedRecipe = await updateRecipe(editingRecipe.id, recipe, token);
      setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? updatedRecipe : r));
      closeEditRecipeModal();
      alert('Recipe updated successfully!');
    } catch (err) {
      console.error('Error updating recipe:', err);
      alert('Failed to update recipe. Please try again.');
    }
  };

  const openAddRecipeModal = () => {
    setIsAddRecipeModalOpen(true);
  };

  const closeAddRecipeModal = () => {
    setIsAddRecipeModalOpen(false);
  };

  const openEditRecipeModal = (recipeToEdit) => {
    setEditingRecipe(recipeToEdit);
    setRecipe({
      title: recipeToEdit.title || '',
      description: recipeToEdit.description || '',
      image: recipeToEdit.image || '',
      prepTime: recipeToEdit.prepTime || '',
      cookTime: recipeToEdit.cookTime || '',
      servings: recipeToEdit.servings || '',
      difficulty: recipeToEdit.difficulty || 'Easy',
      category: recipeToEdit.category || 'Breakfast',
      tags: recipeToEdit.tags || [],
      price: recipeToEdit.price || '',
      nutrition: {
        calories: recipeToEdit.nutrition?.calories || '',
        protein: recipeToEdit.nutrition?.protein || '',
        carbs: recipeToEdit.nutrition?.carbs || '',
        fat: recipeToEdit.nutrition?.fat || '',
        fiber: recipeToEdit.nutrition?.fiber || ''
      },
      ingredients: recipeToEdit.ingredients || [{ name: '', quantity: '', unit: '' }],
      steps: recipeToEdit.steps || [{ text: '', heat: '', temperature: '', time: '' }]
    });
    setIsEditRecipeModalOpen(true);
  };

  const closeEditRecipeModal = () => {
    setIsEditRecipeModalOpen(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (window.confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        const deleteResult = await deleteRecipe(recipeId, token);
        console.log('Delete result:', deleteResult);
        
        // Refresh the recipes list to show updated data
        const updatedRecipes = await fetchRecipes(token);
        console.log('Updated recipes after deletion:', updatedRecipes);
        setRecipes(updatedRecipes);
        
        // Show success message
        alert('Recipe deleted successfully!');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert(`Error deleting recipe: ${error.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Safety check for recipes array
  const safeRecipes = recipes || [];
  console.log('Recipes data:', recipes);
  console.log('Safe recipes:', safeRecipes);

  // Filter dishes based on category and search query
  const filteredDishes = safeRecipes.filter(dish => {
    if (!dish) return false;
    
    // Category filter
    const categoryMatch = selectedCategory === 'All' || 
      dish.category === selectedCategory || 
      (dish.tags && dish.tags.includes(selectedCategory));
    
    // Search filter
    const searchMatch = !searchQuery || 
      dish.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.tags && dish.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )) ||
      (dish.ingredients && dish.ingredients.some(ingredient => 
        ingredient.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return categoryMatch && searchMatch;
  });
  
  console.log('Filtered dishes:', filteredDishes);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`stars ${i < Math.floor(rating) ? 'filled' : ''}`}
        fill={i < Math.floor(rating) ? '#ffc107' : 'none'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="dish-library">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dish-library">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dish-library">
      <div className="dish-library-header">
        <div className="library-title-section">
          <h1 className="library-title">Dish Library</h1>
          <p className="library-subtitle">Discover amazing recipes from around the world</p>
        </div>
        <button 
          className="btn btn-primary btn-add-recipe"
          onClick={openAddRecipeModal}
        >
          <Plus size={20} />
          Add Recipe
        </button>
      </div>

      {searchQuery && (
        <div className="search-results-header">
          <h2>Search Results for "{searchQuery}"</h2>
          <p>{filteredDishes.length} recipe{filteredDishes.length !== 1 ? 's' : ''} found</p>
        </div>
      )}
      
      <div className="categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="dish-grid">
        {filteredDishes.length === 0 ? (
          <div className="no-recipes">
            <p>
              {searchQuery 
                ? `No recipes found for "${searchQuery}"${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.`
                : `No recipes found for ${selectedCategory} category.`
              }
            </p>
            {searchQuery && (
              <p className="search-suggestions">
                Try searching for: "dosa", "paneer", "spicy", "vegetarian", or browse by category.
              </p>
            )}
          </div>
        ) : (
          filteredDishes.map(dish => (
            <div key={dish.id} className="dish-card">
              <Link to={`/recipe/${dish.id}`} className="dish-link">
                <img src={dish.image || '/placeholder-image.jpg'} alt={dish.title || 'Recipe'} className="dish-image" />
                <div className="dish-content">
                  <h3 className="dish-title">{dish.title || 'Untitled Recipe'}</h3>
                  <p className="dish-description">{dish.description || 'No description available'}</p>
                  
                  <div className="dish-rating">
                    {renderStars(dish.rating || 0)}
                    <span>({dish.rating || 0})</span>
                  </div>

                  <div className="dish-meta">
                    <div className="dish-time">
                      <Clock size={16} />
                      {((dish.prepTime || 0) + (dish.cookTime || 0))} min
                    </div>
                    <div className="dish-price">
                      ₹{dish.price || 0}
                    </div>
                  </div>

                  <div className="dish-tags">
                    {dish.tags && dish.tags.length > 0 && dish.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
              <div className="dish-actions">
                <button 
                  className="btn-edit"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openEditRecipeModal(dish);
                  }}
                  title="Edit Recipe"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteRecipe(dish.id, dish.title);
                  }}
                  title="Delete Recipe"
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Recipe Modal */}
      {isAddRecipeModalOpen && (
        <div className="modal-overlay glassy-overlay" onClick={closeAddRecipeModal}>
          <div className="modal-content add-recipe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Recipe</h2>
              <button className="modal-close" onClick={closeAddRecipeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Recipe Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter recipe title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image URL *</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={recipe.image}
                    onChange={handleChange}
                    required
                    placeholder="Enter image URL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={recipe.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your recipe"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prepTime">Prep Time (min) *</label>
                  <input
                    type="number"
                    id="prepTime"
                    name="prepTime"
                    value={recipe.prepTime}
                    onChange={handleChange}
                    required
                    placeholder="15"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cookTime">Cook Time (min) *</label>
                  <input
                    type="number"
                    id="cookTime"
                    name="cookTime"
                    value={recipe.cookTime}
                    onChange={handleChange}
                    required
                    placeholder="30"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="servings">Servings *</label>
                  <input
                    type="number"
                    id="servings"
                    name="servings"
                    value={recipe.servings}
                    onChange={handleChange}
                    required
                    placeholder="4"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={recipe.category}
                    onChange={handleChange}
                    required
                  >
                    {formCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty *</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={recipe.difficulty}
                    onChange={handleChange}
                    required
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={recipe.price}
                    onChange={handleChange}
                    required
                    placeholder="100"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className="btn btn-secondary btn-sm">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="tags-list">
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="tag-remove">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Ingredients</h3>
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-row">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      required
                    />
                    {recipe.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addIngredient} className="btn btn-secondary">
                  <Plus size={16} />
                  Add Ingredient
                </button>
              </div>

              <div className="form-section">
                <h3>Cooking Steps</h3>
                {recipe.steps.map((step, index) => (
                  <div key={index} className="step-row">
                    <div className="step-content">
                      <textarea
                        placeholder="Describe the step"
                        value={step.text}
                        onChange={(e) => updateStep(index, 'text', e.target.value)}
                        required
                        rows="2"
                      />
                      <div className="step-details">
                        <select
                          value={step.heat}
                          onChange={(e) => updateStep(index, 'heat', e.target.value)}
                        >
                          <option value="">Heat Level</option>
                          {heatLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Temperature"
                          value={step.temperature}
                          onChange={(e) => updateStep(index, 'temperature', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Time"
                          value={step.time}
                          onChange={(e) => updateStep(index, 'time', e.target.value)}
                        />
                      </div>
                    </div>
                    {recipe.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="btn btn-danger btn-sm"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addStep} className="btn btn-secondary">
                  <Plus size={16} />
                  Add Step
                </button>
              </div>

              <div className="form-section">
                <h3>Nutrition Information</h3>
                <div className="nutrition-grid">
                  <div className="form-group">
                    <label htmlFor="calories">Calories</label>
                    <input
                      type="number"
                      id="calories"
                      value={recipe.nutrition.calories}
                      onChange={(e) => handleNutritionChange('calories', e.target.value)}
                      placeholder="250"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="protein">Protein (g)</label>
                    <input
                      type="number"
                      id="protein"
                      value={recipe.nutrition.protein}
                      onChange={(e) => handleNutritionChange('protein', e.target.value)}
                      placeholder="15"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="carbs">Carbs (g)</label>
                    <input
                      type="number"
                      id="carbs"
                      value={recipe.nutrition.carbs}
                      onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                      placeholder="30"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fat">Fat (g)</label>
                    <input
                      type="number"
                      id="fat"
                      value={recipe.nutrition.fat}
                      onChange={(e) => handleNutritionChange('fat', e.target.value)}
                      placeholder="10"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fiber">Fiber (g)</label>
                    <input
                      type="number"
                      id="fiber"
                      value={recipe.nutrition.fiber}
                      onChange={(e) => handleNutritionChange('fiber', e.target.value)}
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeAddRecipeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={20} />
                  Add Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {isEditRecipeModalOpen && editingRecipe && (
        <div className="modal-overlay glassy-overlay" onClick={closeEditRecipeModal}>
          <div className="modal-content add-recipe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Recipe</h2>
              <button className="modal-close" onClick={closeEditRecipeModal}>×</button>
            </div>
            
            <form onSubmit={handleUpdateRecipe} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Recipe Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter recipe title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image URL *</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={recipe.image}
                    onChange={handleChange}
                    required
                    placeholder="Enter image URL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={recipe.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your recipe"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prepTime">Prep Time (minutes) *</label>
                  <input
                    type="number"
                    id="prepTime"
                    name="prepTime"
                    value={recipe.prepTime}
                    onChange={handleChange}
                    required
                    placeholder="15"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cookTime">Cook Time (minutes) *</label>
                  <input
                    type="number"
                    id="cookTime"
                    name="cookTime"
                    value={recipe.cookTime}
                    onChange={handleChange}
                    required
                    placeholder="30"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="servings">Servings *</label>
                  <input
                    type="number"
                    id="servings"
                    name="servings"
                    value={recipe.servings}
                    onChange={handleChange}
                    required
                    placeholder="4"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty *</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={recipe.difficulty}
                    onChange={handleChange}
                    required
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={recipe.category}
                    onChange={handleChange}
                    required
                  >
                    {formCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={recipe.price}
                    onChange={handleChange}
                    required
                    placeholder="150"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={addTag}
                    placeholder="Add a tag and press Enter"
                  />
                  <button type="button" onClick={addTag} className="btn-add-tag">Add</button>
                </div>
                <div className="tags-list">
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="tag-remove">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Ingredients</h3>
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-row">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="tsp">tsp</option>
                      <option value="tbsp">tbsp</option>
                      <option value="cup">cup</option>
                      <option value="pieces">pieces</option>
                    </select>
                    <button type="button" onClick={() => removeIngredient(index)} className="btn-remove">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addIngredient} className="btn-add">
                  <Plus size={16} />
                  Add Ingredient
                </button>
              </div>

              <div className="form-section">
                <h3>Cooking Steps</h3>
                {recipe.steps.map((step, index) => (
                  <div key={index} className="step-row">
                    <div className="step-content">
                      <textarea
                        placeholder="Describe the step"
                        value={step.text}
                        onChange={(e) => handleStepChange(index, 'text', e.target.value)}
                        rows="2"
                      />
                      <div className="step-details">
                        <select
                          value={step.heat}
                          onChange={(e) => handleStepChange(index, 'heat', e.target.value)}
                        >
                          <option value="">Heat Level</option>
                          {heatLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Temperature"
                          value={step.temperature}
                          onChange={(e) => handleStepChange(index, 'temperature', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Time"
                          value={step.time}
                          onChange={(e) => handleStepChange(index, 'time', e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeStep(index)} className="btn-remove">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addStep} className="btn-add">
                  <Plus size={16} />
                  Add Step
                </button>
              </div>

              <div className="form-section">
                <h3>Nutrition Information</h3>
                <div className="nutrition-grid">
                  <div className="form-group">
                    <label htmlFor="calories">Calories</label>
                    <input
                      type="number"
                      id="calories"
                      value={recipe.nutrition.calories}
                      onChange={(e) => handleNutritionChange('calories', e.target.value)}
                      placeholder="300"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="protein">Protein (g)</label>
                    <input
                      type="number"
                      id="protein"
                      value={recipe.nutrition.protein}
                      onChange={(e) => handleNutritionChange('protein', e.target.value)}
                      placeholder="15"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="carbs">Carbs (g)</label>
                    <input
                      type="number"
                      id="carbs"
                      value={recipe.nutrition.carbs}
                      onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                      placeholder="30"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fat">Fat (g)</label>
                    <input
                      type="number"
                      id="fat"
                      value={recipe.nutrition.fat}
                      onChange={(e) => handleNutritionChange('fat', e.target.value)}
                      placeholder="10"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fiber">Fiber (g)</label>
                    <input
                      type="number"
                      id="fiber"
                      value={recipe.nutrition.fiber}
                      onChange={(e) => handleNutritionChange('fiber', e.target.value)}
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeEditRecipeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Save size={16} />
                  Update Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishLibrary;