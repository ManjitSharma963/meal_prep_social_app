/**
 * Safe property access utilities to prevent null reference errors
 */

/**
 * Safely access nested object properties
 * @param {Object} obj - The object to access
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} The value at the path or default value
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
};

/**
 * Safely access array elements
 * @param {Array} arr - The array to access
 * @param {number} index - The index to access
 * @param {*} defaultValue - Default value if index doesn't exist
 * @returns {*} The element at the index or default value
 */
export const safeGetArray = (arr, index, defaultValue = null) => {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  return arr[index];
};

/**
 * Safely call a function if it exists
 * @param {Function} fn - The function to call
 * @param {*} context - The context to call the function with
 * @param {...*} args - Arguments to pass to the function
 * @returns {*} The result of the function call or null
 */
export const safeCall = (fn, context = null, ...args) => {
  if (typeof fn === 'function') {
    try {
      return fn.call(context, ...args);
    } catch (error) {
      console.warn('Safe call error:', error);
      return null;
    }
  }
  return null;
};

/**
 * Safely access object properties with type checking
 * @param {Object} obj - The object to access
 * @param {string} key - The key to access
 * @param {string} expectedType - Expected type ('string', 'number', 'object', 'array', etc.)
 * @param {*} defaultValue - Default value if key doesn't exist or type doesn't match
 * @returns {*} The value if it matches the expected type, otherwise default value
 */
export const safeGetTyped = (obj, key, expectedType, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const value = obj[key];
  
  if (value === null || value === undefined) return defaultValue;
  
  switch (expectedType) {
    case 'string':
      return typeof value === 'string' ? value : defaultValue;
    case 'number':
      return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
    case 'boolean':
      return typeof value === 'boolean' ? value : defaultValue;
    case 'object':
      return typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
    case 'array':
      return Array.isArray(value) ? value : defaultValue;
    case 'function':
      return typeof value === 'function' ? value : defaultValue;
    default:
      return value;
  }
};

/**
 * Safely map over an array
 * @param {Array} arr - The array to map over
 * @param {Function} mapper - The mapping function
 * @param {Array} defaultValue - Default value if array is invalid
 * @returns {Array} The mapped array or default value
 */
export const safeMap = (arr, mapper, defaultValue = []) => {
  if (!Array.isArray(arr)) return defaultValue;
  
  try {
    return arr.map(mapper);
  } catch (error) {
    console.warn('Safe map error:', error);
    return defaultValue;
  }
};

/**
 * Safely filter an array
 * @param {Array} arr - The array to filter
 * @param {Function} predicate - The filter function
 * @param {Array} defaultValue - Default value if array is invalid
 * @returns {Array} The filtered array or default value
 */
export const safeFilter = (arr, predicate, defaultValue = []) => {
  if (!Array.isArray(arr)) return defaultValue;
  
  try {
    return arr.filter(predicate);
  } catch (error) {
    console.warn('Safe filter error:', error);
    return defaultValue;
  }
};

/**
 * Safely find an element in an array
 * @param {Array} arr - The array to search
 * @param {Function} predicate - The search function
 * @param {*} defaultValue - Default value if not found
 * @returns {*} The found element or default value
 */
export const safeFind = (arr, predicate, defaultValue = null) => {
  if (!Array.isArray(arr)) return defaultValue;
  
  try {
    return arr.find(predicate) || defaultValue;
  } catch (error) {
    console.warn('Safe find error:', error);
    return defaultValue;
  }
};

/**
 * Safely get the length of an array
 * @param {Array} arr - The array to get length of
 * @returns {number} The length of the array or 0
 */
export const safeLength = (arr) => {
  return Array.isArray(arr) ? arr.length : 0;
};

/**
 * Safely access nested properties with fallback chain
 * @param {Object} obj - The object to access
 * @param {Array} paths - Array of paths to try in order
 * @param {*} defaultValue - Default value if no path exists
 * @returns {*} The first found value or default value
 */
export const safeGetFallback = (obj, paths, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  for (const path of paths) {
    const value = safeGet(obj, path);
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  
  return defaultValue;
};

/**
 * Safely format a string with null checks
 * @param {string} template - The template string
 * @param {Object} values - Values to interpolate
 * @param {string} defaultValue - Default value if template is invalid
 * @returns {string} The formatted string or default value
 */
export const safeFormat = (template, values = {}, defaultValue = '') => {
  if (typeof template !== 'string') return defaultValue;
  
  try {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  } catch (error) {
    console.warn('Safe format error:', error);
    return defaultValue;
  }
};

/**
 * Safely parse JSON
 * @param {string} jsonString - The JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} The parsed object or default value
 */
export const safeParseJSON = (jsonString, defaultValue = null) => {
  if (typeof jsonString !== 'string') return defaultValue;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Safe JSON parse error:', error);
    return defaultValue;
  }
};

/**
 * Safely stringify an object
 * @param {*} obj - The object to stringify
 * @param {string} defaultValue - Default value if stringification fails
 * @returns {string} The JSON string or default value
 */
export const safeStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Safe JSON stringify error:', error);
    return defaultValue;
  }
};

/**
 * Create a safe component wrapper that handles null props
 * @param {Function} Component - The component to wrap
 * @param {Object} defaultProps - Default props to use if props are null
 * @returns {Function} The wrapped component
 */
export const withSafeProps = (Component, defaultProps = {}) => {
  return (props) => {
    const safeProps = { ...defaultProps, ...props };
    return Component(safeProps);
  };
};

/**
 * Safely access recipe properties with common fallbacks
 * @param {Object} recipe - The recipe object
 * @param {string} property - The property to access
 * @returns {*} The property value or appropriate fallback
 */
export const safeRecipeGet = (recipe, property) => {
  if (!recipe || typeof recipe !== 'object') return null;
  
  const fallbacks = {
    title: 'Untitled Recipe',
    description: 'No description available',
    image: '/placeholder-recipe.jpg',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    rating: 0,
    difficulty: 'Unknown',
    category: 'Uncategorized',
    price: 0,
    ingredients: [],
    steps: []
  };
  
  return safeGet(recipe, property, fallbacks[property] || null);
};

/**
 * Safely access user properties with common fallbacks
 * @param {Object} user - The user object
 * @param {string} property - The property to access
 * @returns {*} The property value or appropriate fallback
 */
export const safeUserGet = (user, property) => {
  if (!user || typeof user !== 'object') return null;
  
  const fallbacks = {
    username: 'Unknown User',
    email: 'No email',
    firstName: 'Unknown',
    lastName: 'User',
    phoneNumber: 'No phone',
    businessName: 'No business',
    businessDescription: 'No description',
    businessAddress: 'No address',
    businessPhone: 'No phone',
    businessEmail: 'No email',
    businessWebsite: ''
  };
  
  return safeGet(user, property, fallbacks[property] || null);
};

export default {
  safeGet,
  safeGetArray,
  safeCall,
  safeGetTyped,
  safeMap,
  safeFilter,
  safeFind,
  safeLength,
  safeGetFallback,
  safeFormat,
  safeParseJSON,
  safeStringify,
  withSafeProps,
  safeRecipeGet,
  safeUserGet
};
