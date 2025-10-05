# CSS Architecture Documentation

## Overview
The CSS has been reorganized into separate, focused files for better maintainability and organization.

## File Structure

```
src/styles/
├── index.css          # Main styles index - imports all other CSS files
├── modals.css         # Base modal styles (overlay, content, animations)
├── recipe-modal.css   # Recipe-specific modal styles (add/edit recipe)
├── ingredient-form.css # Ingredient form specific styles
├── dish-library.css   # Dish library component styles
├── recipe-detail.css  # Recipe detail page styles (view specific recipe)
└── README.md         # This documentation file
```

## File Descriptions

### `index.css`
- Main entry point that imports all other CSS files
- Contains global styles and utility classes
- Includes common components like buttons, forms, cards
- Responsive utilities and spacing classes

### `modals.css`
- Base modal functionality and styling
- Modal overlay, content, header, footer styles
- Animation keyframes for modal transitions
- Responsive modal behavior

### `recipe-modal.css`
- Specific styles for recipe add/edit modals
- Glassy effects and backdrop blur
- Recipe form styling and layout
- Enhanced visual effects for recipe modals

### `ingredient-form.css`
- Ingredient input row styling
- Add/remove ingredient button styles
- Tag management styles
- Step and nutrition form sections
- Custom ingredient card design

### `dish-library.css`
- Dish library component layout
- Recipe card styling and hover effects
- Category filtering and search
- Grid layout and responsive design
- Edit button and action styling

### `recipe-detail.css`
- Recipe detail page layout and styling
- Recipe header with image, title, and metadata
- Ingredients section with interactive list
- Cooking steps with numbered progression
- Responsive design for all screen sizes
- Modern glassmorphism design elements

## Usage

### In Components
Import the specific CSS files you need:

```javascript
// For components with modals
import '../styles/modals.css';

// For recipe-related components
import '../styles/recipe-modal.css';
import '../styles/ingredient-form.css';

// For dish library
import '../styles/dish-library.css';

// Or import everything
import '../styles/index.css';
```

### In Main App
The main App.js imports the index.css which includes all styles:

```javascript
import './styles/index.css';
```

## Benefits

1. **Modularity**: Each file focuses on a specific area
2. **Maintainability**: Easier to find and update specific styles
3. **Performance**: Only load CSS needed for specific components
4. **Organization**: Clear separation of concerns
5. **Reusability**: Styles can be easily reused across components

## Migration Notes

- Old `App.css` has been backed up as `App-old.css`
- All existing functionality preserved
- No breaking changes to existing components
- Enhanced glassy effects for recipe modals
- Improved ingredient form styling

## Future Enhancements

- Add CSS variables for consistent theming
- Implement CSS modules for better scoping
- Add dark mode support
- Optimize for better performance
