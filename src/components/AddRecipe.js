import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createRecipe } from '../utils/api';
import { Plus, X, Save, Clock, Users, ChefHat, Star, ChevronUp, ChevronDown } from 'lucide-react';
import '../styles/recipe-modal.css';
const AddRecipe = () => {
  const { token } = useAuth();
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
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

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const heatLevels = ['Low', 'Medium', 'Medium-High', 'High', 'Room Temperature'];

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

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index][field] = value;
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };

  const moveIngredient = (fromIndex, toIndex) => {
    const newIngredients = [...recipe.ingredients];
    const [movedIngredient] = newIngredients.splice(fromIndex, 1);
    newIngredients.splice(toIndex, 0, movedIngredient);
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const removeIngredient = (index) => {
    if (recipe.ingredients.length > 1) {
      const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
      setRecipe(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...recipe.steps];
    newSteps[index][field] = value;
    setRecipe(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setRecipe(prev => ({
      ...prev,
      steps: [...prev.steps, { text: '', heat: '', temperature: '', time: '' }]
    }));
  };

  const moveStep = (fromIndex, toIndex) => {
    const newSteps = [...recipe.steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    setRecipe(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const removeStep = (index) => {
    if (recipe.steps.length > 1) {
      const newSteps = recipe.steps.filter((_, i) => i !== index);
      setRecipe(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
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
      const result = await createRecipe(recipe, token);
      console.log('Recipe submitted successfully:', result);
      alert('Recipe added successfully!');
      
      // Reset form
      setRecipe({
        title: '',
        description: '',
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
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Failed to submit recipe. Please try again later.');
    }
  };

  return (
    <div className="recipe-page-wrapper">
      <div className="recipe-form-container">
    <div className="recipe-form-header">
      <h1 className="form-title">Add New Recipe</h1>
      <p className="form-subtitle">Share your delicious recipe with the community</p>
    </div>
  
    <form onSubmit={handleSubmit} className="recipe-form">
      {/* Basic Information */}
      <div className="form-section">
        <h2 className="section-heading">Basic Information</h2>
  
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Recipe Title *</label>
            <input
              type="text"
              value={recipe.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="glass-input"
              placeholder="e.g., Masala Dosa"
              required
            />
          </div>
  
          <div className="input-group">
            <label className="input-label">Category *</label>
            <select
              value={recipe.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="glass-input"
              required
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
  
          <div className="input-group">
            <label className="input-label">Difficulty *</label>
            <select
              value={recipe.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="glass-input"
              required
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
  
          <div className="input-group">
            <label className="input-label">Price (₹)</label>
            <input
              type="number"
              value={recipe.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="glass-input"
              placeholder="e.g., 130"
            />
          </div>
        </div>
  
        <div className="input-group full-width">
          <label className="input-label">Description *</label>
          <textarea
            value={recipe.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="glass-textarea"
            placeholder="Describe your recipe..."
            rows="3"
            required
          />
        </div>
      </div>
  
      {/* Ingredients */}
      <div className="form-section">
        <div className="section-header">
          <h2 className="section-heading">Ingredients ({recipe.ingredients.length})</h2>
          <button type="button" onClick={addIngredient} className="btn glass-btn">
            + Add Ingredient
          </button>
        </div>
  
        <div className="ingredient-list">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                className="glass-input"
                placeholder="Ingredient Name"
                required
              />
              <input
                type="text"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                className="glass-input"
                placeholder="Quantity"
                required
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                className="glass-input"
                placeholder="Unit"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn btn-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
  
      {/* Cooking Steps */}
      <div className="form-section">
        <div className="section-header">
          <h2 className="section-heading">Cooking Steps ({recipe.steps.length})</h2>
          <button type="button" onClick={addStep} className="btn glass-btn">
            + Add Step
          </button>
        </div>
  
        <div className="steps-list">
          {recipe.steps.map((step, index) => (
            <div key={index} className="step-item">
              <textarea
                value={step.text}
                onChange={(e) => handleStepChange(index, 'text', e.target.value)}
                className="glass-textarea"
                placeholder="Describe this step..."
                required
              />
            </div>
          ))}
        </div>
      </div>
  
      {/* Submit Button */}
      <div className="form-actions">
        <button type="submit" className="btn glass-btn-primary">
          Save Recipe
        </button>
      </div>
    </form>
      </div>
    </div>
  );
};

export default AddRecipe;
