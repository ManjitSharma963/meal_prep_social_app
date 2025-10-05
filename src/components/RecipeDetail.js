import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { makeAuthenticatedRequest } from '../utils/api';
import { Clock, Users, ChefHat, Star, Heart, Share2, Timer, Thermometer, Flame } from 'lucide-react';
import { detailedRecipes } from '../data/recipes';
import '../styles/admin-components.css';
import '../styles/recipe-detail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [servings, setServings] = useState(2);
  const [cookingMode, setCookingMode] = useState('beginner'); // beginner or pro
  const [isFavorite, setIsFavorite] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipe from API
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await makeAuthenticatedRequest(
          `http://localhost:3002/recipes/${id}`,
          { method: 'GET' },
          token
        );
        
        const data = await response.json();
        setRecipe(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again later.');
        // Fallback to detailed recipes or sample data
        setRecipe(detailedRecipes[id] || {
    id: 1,
    title: 'Masala Dosa',
    description: 'Crispy South Indian crepe filled with spiced potato mixture. A perfect breakfast or brunch dish that\'s both delicious and nutritious.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    rating: 4.8,
    difficulty: 'Medium',
    category: 'Breakfast',
    tags: ['Indian', 'Vegetarian', 'Gluten-Free'],
    price: 130,
    nutrition: {
      calories: 320,
      protein: 8,
      carbs: 45,
      fat: 12,
      fiber: 4
    },
    ingredients: [
      { name: 'Rice batter', quantity: '2', unit: 'cups' },
      { name: 'Potato', quantity: '3', unit: 'medium (boiled & mashed)' },
      { name: 'Onion', quantity: '1', unit: 'large (sliced)' },
      { name: 'Green chili', quantity: '2', unit: 'pieces' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'as required', unit: '' },
      { name: 'Turmeric powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Mustard seeds', quantity: '1', unit: 'tsp' },
      { name: 'Curry leaves', quantity: '8-10', unit: 'leaves' }
    ],
    steps: [
      {
        text: 'Heat a non-stick pan on medium flame (180°C) and grease it lightly with oil.',
        heat: 'Medium',
        temperature: '180°C',
        time: '2 min'
      },
      {
        text: 'Pour one ladle of batter in the center and spread it thin in circular motion.',
        heat: 'Medium',
        temperature: '180°C',
        time: '1 min'
      },
      {
        text: 'Cook for 2 minutes on medium heat until the edges start to lift and turn golden.',
        heat: 'Medium',
        temperature: '180°C',
        time: '2 min'
      },
      {
        text: 'In another pan, heat oil and add mustard seeds. When they splutter, add curry leaves.',
        heat: 'Medium-High',
        temperature: '200°C',
        time: '1 min'
      },
      {
        text: 'Add sliced onions and green chilies. Sauté on medium-high flame for 3 minutes until translucent.',
        heat: 'Medium-High',
        temperature: '200°C',
        time: '3 min'
      },
      {
        text: 'Add boiled and mashed potatoes, turmeric powder, and salt. Mix well and cook for 2 minutes.',
        heat: 'Medium',
        temperature: '180°C',
        time: '2 min'
      },
      {
        text: 'Place the potato mixture in the center of the dosa and fold it. Serve hot with chutney.',
        heat: 'Low',
        temperature: '150°C',
        time: '1 min'
      }
    ]
  });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, token]);

  if (loading) {
    return (
      <div className="recipe-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail">
        <div className="error-container">
          <p className="error-message">{error || 'Recipe not found'}</p>
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

  const adjustServings = (newServings) => {
    setServings(newServings);
  };

  const getAdjustedQuantity = (ingredient) => {
    const multiplier = servings / (recipe.servings || 2);
    if (ingredient.quantity === 'as required') return ingredient.quantity;
    
    const quantity = parseFloat(ingredient.quantity);
    if (isNaN(quantity)) return ingredient.quantity;
    
    return (quantity * multiplier).toFixed(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className="stars"
        fill={i < Math.floor(rating) ? '#ffc107' : 'none'}
      />
    ));
  };

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <img src={recipe.image || '/placeholder-recipe.jpg'} alt={recipe.title || 'Recipe'} className="recipe-image" />
        
        <div className="recipe-title">{recipe.title || 'Untitled Recipe'}</div>
        
        <div className="recipe-meta">
          <div className="meta-item">
            <Clock size={20} />
            <div>
              <div>Prep: {recipe.prepTime || 0} min</div>
              <div>Cook: {recipe.cookTime || 0} min</div>
            </div>
          </div>
          <div className="meta-item">
            <Users size={20} />
            <div>
              <div>Servings: {servings}</div>
              <div>Difficulty: {recipe.difficulty || 'Unknown'}</div>
            </div>
          </div>
          <div className="meta-item">
            <Star size={20} />
            <div>
              <div>Rating: {recipe.rating || 0}/5</div>
              <div>{renderStars(recipe.rating || 0)}</div>
            </div>
          </div>
          <div className="meta-item">
            <div>Price: ₹{recipe.price || 0}</div>
            <div>Calories: {recipe.nutrition?.calories || 'N/A'}</div>
          </div>
        </div>

        <div className="recipe-description">{recipe.description || 'No description available'}</div>

        <div className="flex gap-2 mb-3">
          <button
            className={`btn ${isFavorite ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={20} />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
          <button className="btn btn-secondary">
            <Share2 size={20} />
            Share Recipe
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <label>Servings: </label>
          <input
            type="number"
            value={servings}
            onChange={(e) => adjustServings(parseInt(e.target.value))}
            min="1"
            max="10"
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex gap-2">
          <label>Cooking Mode: </label>
          <select
            value={cookingMode}
            onChange={(e) => setCookingMode(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="beginner">Beginner Mode</option>
            <option value="pro">Pro Mode</option>
          </select>
        </div>
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <h2 className="section-title">
            <ChefHat size={24} />
            Ingredients
          </h2>
          <ul className="ingredient-list">
            {(recipe.ingredients || []).map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                <span className="ingredient-name">{ingredient.name}</span>
                <span className="ingredient-quantity">
                  {getAdjustedQuantity(ingredient)} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="steps-section">
          <h2 className="section-title">
            <Timer size={24} />
            Cooking Steps ({(recipe.steps || []).length})
          </h2>
          <ul className="step-list">
            {(recipe.steps || []).map((step, index) => (
              <li key={index} className="step-item">
                <div className="step-content">
                  <div className="step-text">{step.text}</div>
                  {cookingMode === 'beginner' && (
                    <div className="step-meta">
                      <div className="step-meta-item">
                        <Flame size={16} />
                        <span>{step.heat}</span>
                      </div>
                      <div className="step-meta-item">
                        <Thermometer size={16} />
                        <span>{step.temperature}</span>
                      </div>
                      <div className="step-meta-item">
                        <Timer size={16} />
                        <span>{step.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
