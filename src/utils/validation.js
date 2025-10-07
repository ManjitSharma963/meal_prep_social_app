/**
 * Frontend validation utilities that match backend validation patterns exactly
 * This ensures consistency between frontend and backend validation
 */

// Validation patterns that match backend @Pattern annotations
export const VALIDATION_PATTERNS = {
  // User validation patterns
  USERNAME: /^[a-zA-Z0-9_]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  NAME: /^[a-zA-Z\s'-]+$/,
  PHONE: /^[0-9\s\-+().]*$/,
  
  // Business validation patterns
  BUSINESS_NAME: /^[a-zA-Z0-9\s\-_&().,']+$/,
  BUSINESS_TYPE: /^[a-zA-Z\s]*$/,
  BUSINESS_PHONE: /^[0-9\s\-+().]*$|^$/,
  BUSINESS_EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^$/,
  
  // Inventory validation patterns
  INVENTORY_NAME: /^[a-zA-Z0-9\s\-_&().,']+$/,
  PRODUCT_ID: /^[A-Z0-9_]+$/,
  UNIT: /^[a-zA-Z\s]*$/,
  TYPE: /^[A-Z_]+$/,
  
  // Order validation patterns
  MOBILE_NUMBER: /^[6-9]\d{9}$/,
  
  // Recipe validation patterns
  URL: /^https?:\/\/.+/,
};

// Validation size constraints that match backend @Size annotations
export const VALIDATION_SIZES = {
  USERNAME: { min: 3, max: 30 },
  EMAIL: { max: 100 },
  PASSWORD: { min: 8, max: 128 },
  FIRST_NAME: { min: 2, max: 30 },
  LAST_NAME: { min: 2, max: 30 },
  PHONE: { max: 15 },
  BUSINESS_NAME: { min: 2, max: 100 },
  BUSINESS_DESCRIPTION: { max: 1000 },
  BUSINESS_TYPE: { max: 50 },
  BUSINESS_ADDRESS: { max: 200 },
  BUSINESS_PHONE: { max: 15 },
  BUSINESS_EMAIL: { max: 100 },
  BUSINESS_WEBSITE: { max: 200 },
  INVENTORY_NAME: { min: 2, max: 100 },
  PRODUCT_ID: { min: 3, max: 50 },
  RECIPE_TITLE: { max: 255 },
  RECIPE_DESCRIPTION: { max: 2000 },
  RECIPE_IMAGE: { max: 500 },
  RECIPE_CATEGORY: { max: 100 },
  PREP_TIME: { min: 0, max: 999 },
  COOK_TIME: { min: 0, max: 999 },
  SERVINGS: { min: 1, max: 50 },
  RATING: { min: 0.0, max: 5.0 },
  PRICE: { min: 0, max: 999999.99, decimal: 2 },
};

// Validation error messages that match backend messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  USERNAME: {
    REQUIRED: 'Username is required',
    SIZE: 'Username must be between 3 and 30 characters',
    PATTERN: 'Username must contain only letters, numbers, and underscores'
  },
  EMAIL: {
    REQUIRED: 'Email is required',
    VALID: 'Email should be valid',
    SIZE: 'Email must not exceed 100 characters'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    SIZE: 'Password must be between 8 and 128 characters',
    PATTERN: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'
  },
  NAME: {
    REQUIRED: 'Name is required',
    SIZE: 'Name must be between 2 and 30 characters',
    PATTERN: 'Name must contain only letters, spaces, hyphens, and apostrophes'
  },
  PHONE: {
    SIZE: 'Phone number must not exceed 15 characters',
    PATTERN: 'Phone number must contain only numbers, spaces, and phone symbols'
  },
  BUSINESS: {
    NAME_REQUIRED: 'Business name is required',
    NAME_SIZE: 'Business name must be between 2 and 100 characters',
    NAME_PATTERN: 'Business name must contain only letters, numbers, spaces, and common punctuation',
    DESCRIPTION_SIZE: 'Business description must not exceed 1000 characters',
    TYPE_SIZE: 'Business type must not exceed 50 characters',
    TYPE_PATTERN: 'Business type must contain only letters and spaces',
    ADDRESS_SIZE: 'Business address must not exceed 200 characters',
    PHONE_SIZE: 'Business phone must not exceed 15 characters',
    PHONE_PATTERN: 'Business phone must contain only numbers, spaces, and phone symbols or be empty',
    EMAIL_SIZE: 'Business email must not exceed 100 characters',
    EMAIL_PATTERN: 'Business email must be a valid email format or empty',
    WEBSITE_SIZE: 'Business website must not exceed 200 characters'
  },
  INVENTORY: {
    NAME_REQUIRED: 'Name is required',
    NAME_SIZE: 'Name must be between 2 and 100 characters',
    NAME_PATTERN: 'Name must contain only letters, numbers, spaces, and common punctuation',
    PRODUCT_ID_REQUIRED: 'Product ID is required',
    PRODUCT_ID_SIZE: 'Product ID must be between 3 and 50 characters',
    PRODUCT_ID_PATTERN: 'Product ID must contain only uppercase letters, numbers, and underscores',
    PRICE_REQUIRED: 'Price is required',
    PRICE_POSITIVE: 'Price must be zero or positive',
    PRICE_MAX: 'Price must not exceed 999999.99',
    PRICE_DECIMAL: 'Price must have at most 6 integer digits and 2 decimal places'
  },
  ORDER: {
    MOBILE_REQUIRED: 'Customer mobile number is required',
    MOBILE_PATTERN: 'Mobile number must be a valid 10-digit Indian mobile number'
  },
  RECIPE: {
    TITLE_REQUIRED: 'Title is required',
    TITLE_SIZE: 'Title must not exceed 255 characters',
    DESCRIPTION_SIZE: 'Description must not exceed 2000 characters',
    IMAGE_SIZE: 'Image URL must not exceed 500 characters',
    PREP_TIME_MIN: 'Prep time must be non-negative',
    PREP_TIME_MAX: 'Prep time must not exceed 999 minutes',
    COOK_TIME_MIN: 'Cook time must be non-negative',
    COOK_TIME_MAX: 'Cook time must not exceed 999 minutes',
    SERVINGS_MIN: 'Servings must be at least 1',
    SERVINGS_MAX: 'Servings must not exceed 50',
    RATING_MIN: 'Rating must be at least 0.0',
    RATING_MAX: 'Rating must be at most 5.0',
    CATEGORY_SIZE: 'Category must not exceed 100 characters'
  }
};

/**
 * Generic validation function
 */
export const validateField = (value, rules) => {
  const errors = [];
  
  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(rules.requiredMessage || VALIDATION_MESSAGES.REQUIRED);
    return errors;
  }
  
  // Skip other validations if value is empty and not required
  if (!value || value.trim() === '') {
    return errors;
  }
  
  // Size validation
  if (rules.size) {
    const { min, max } = rules.size;
    if (min && value.length < min) {
      errors.push(rules.sizeMessage || `Must be at least ${min} characters`);
    }
    if (max && value.length > max) {
      errors.push(rules.sizeMessage || `Must not exceed ${max} characters`);
    }
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.patternMessage || 'Invalid format');
  }
  
  // Numeric validation
  if (rules.numeric) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      errors.push('Must be a valid number');
    } else {
      if (rules.min !== undefined && num < rules.min) {
        errors.push(`Must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push(`Must not exceed ${rules.max}`);
      }
    }
  }
  
  // Email validation
  if (rules.email && !VALIDATION_PATTERNS.EMAIL.test(value)) {
    errors.push('Must be a valid email address');
  }
  
  return errors;
};

/**
 * User validation functions
 */
export const validateUsername = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.USERNAME.REQUIRED,
    size: VALIDATION_SIZES.USERNAME,
    sizeMessage: VALIDATION_MESSAGES.USERNAME.SIZE,
    pattern: VALIDATION_PATTERNS.USERNAME,
    patternMessage: VALIDATION_MESSAGES.USERNAME.PATTERN
  });
};

export const validateEmail = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.EMAIL.REQUIRED,
    size: VALIDATION_SIZES.EMAIL,
    sizeMessage: VALIDATION_MESSAGES.EMAIL.SIZE,
    email: true
  });
};

export const validatePassword = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.PASSWORD.REQUIRED,
    size: VALIDATION_SIZES.PASSWORD,
    sizeMessage: VALIDATION_MESSAGES.PASSWORD.SIZE,
    pattern: VALIDATION_PATTERNS.PASSWORD,
    patternMessage: VALIDATION_MESSAGES.PASSWORD.PATTERN
  });
};

export const validateName = (value, fieldName = 'Name') => {
  return validateField(value, {
    required: true,
    requiredMessage: `${fieldName} is required`,
    size: VALIDATION_SIZES.FIRST_NAME,
    sizeMessage: `${fieldName} must be between 2 and 30 characters`,
    pattern: VALIDATION_PATTERNS.NAME,
    patternMessage: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes`
  });
};

export const validatePhone = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Phone number is required',
    size: VALIDATION_SIZES.PHONE,
    sizeMessage: VALIDATION_MESSAGES.PHONE.SIZE,
    pattern: VALIDATION_PATTERNS.PHONE,
    patternMessage: VALIDATION_MESSAGES.PHONE.PATTERN
  });
};

/**
 * Business validation functions
 */
export const validateBusinessName = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.BUSINESS.NAME_REQUIRED,
    size: VALIDATION_SIZES.BUSINESS_NAME,
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.NAME_SIZE,
    pattern: VALIDATION_PATTERNS.BUSINESS_NAME,
    patternMessage: VALIDATION_MESSAGES.BUSINESS.NAME_PATTERN
  });
};

export const validateBusinessDescription = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Business description is required',
    size: { max: VALIDATION_SIZES.BUSINESS_DESCRIPTION.max },
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.DESCRIPTION_SIZE
  });
};

export const validateBusinessType = (value) => {
  return validateField(value, {
    size: VALIDATION_SIZES.BUSINESS_TYPE,
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.TYPE_SIZE,
    pattern: VALIDATION_PATTERNS.BUSINESS_TYPE,
    patternMessage: VALIDATION_MESSAGES.BUSINESS.TYPE_PATTERN
  });
};

export const validateBusinessAddress = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Business address is required',
    size: VALIDATION_SIZES.BUSINESS_ADDRESS,
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.ADDRESS_SIZE
  });
};

export const validateBusinessPhone = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Business phone is required',
    size: VALIDATION_SIZES.BUSINESS_PHONE,
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.PHONE_SIZE,
    pattern: VALIDATION_PATTERNS.BUSINESS_PHONE,
    patternMessage: VALIDATION_MESSAGES.BUSINESS.PHONE_PATTERN
  });
};

export const validateBusinessEmail = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Business email is required',
    size: VALIDATION_SIZES.BUSINESS_EMAIL,
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.EMAIL_SIZE,
    pattern: VALIDATION_PATTERNS.BUSINESS_EMAIL,
    patternMessage: VALIDATION_MESSAGES.BUSINESS.EMAIL_PATTERN
  });
};

export const validateBusinessWebsite = (value) => {
  if (!value || value.trim() === '') return [];
  
  return validateField(value, {
    size: VALIDATION_SIZES.BUSINESS_WEBSITE,
    sizeMessage: VALIDATION_MESSAGES.BUSINESS.WEBSITE_SIZE,
    pattern: VALIDATION_PATTERNS.URL,
    patternMessage: 'Website must start with http:// or https://'
  });
};

/**
 * Recipe validation functions
 */
export const validateRecipeTitle = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.RECIPE.TITLE_REQUIRED,
    size: VALIDATION_SIZES.RECIPE_TITLE,
    sizeMessage: VALIDATION_MESSAGES.RECIPE.TITLE_SIZE
  });
};

export const validateRecipeDescription = (value) => {
  return validateField(value, {
    size: VALIDATION_SIZES.RECIPE_DESCRIPTION,
    sizeMessage: VALIDATION_MESSAGES.RECIPE.DESCRIPTION_SIZE
  });
};

export const validatePrepTime = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Prep time is required',
    numeric: true,
    min: VALIDATION_SIZES.PREP_TIME.min,
    max: VALIDATION_SIZES.PREP_TIME.max
  });
};

export const validateCookTime = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Cook time is required',
    numeric: true,
    min: VALIDATION_SIZES.COOK_TIME.min,
    max: VALIDATION_SIZES.COOK_TIME.max
  });
};

export const validateServings = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: 'Servings is required',
    numeric: true,
    min: VALIDATION_SIZES.SERVINGS.min,
    max: VALIDATION_SIZES.SERVINGS.max
  });
};

export const validateRating = (value) => {
  return validateField(value, {
    numeric: true,
    min: VALIDATION_SIZES.RATING.min,
    max: VALIDATION_SIZES.RATING.max
  });
};

/**
 * Order validation functions
 */
export const validateMobileNumber = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.ORDER.MOBILE_REQUIRED,
    pattern: VALIDATION_PATTERNS.MOBILE_NUMBER,
    patternMessage: VALIDATION_MESSAGES.ORDER.MOBILE_PATTERN
  });
};

/**
 * Inventory validation functions
 */
export const validateInventoryName = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.INVENTORY.NAME_REQUIRED,
    size: VALIDATION_SIZES.INVENTORY_NAME,
    sizeMessage: VALIDATION_MESSAGES.INVENTORY.NAME_SIZE,
    pattern: VALIDATION_PATTERNS.INVENTORY_NAME,
    patternMessage: VALIDATION_MESSAGES.INVENTORY.NAME_PATTERN
  });
};

export const validateProductId = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.INVENTORY.PRODUCT_ID_REQUIRED,
    size: VALIDATION_SIZES.PRODUCT_ID,
    sizeMessage: VALIDATION_MESSAGES.INVENTORY.PRODUCT_ID_SIZE,
    pattern: VALIDATION_PATTERNS.PRODUCT_ID,
    patternMessage: VALIDATION_MESSAGES.INVENTORY.PRODUCT_ID_PATTERN
  });
};

export const validatePrice = (value) => {
  return validateField(value, {
    required: true,
    requiredMessage: VALIDATION_MESSAGES.INVENTORY.PRICE_REQUIRED,
    numeric: true,
    min: 0,
    max: VALIDATION_SIZES.PRICE.max
  });
};

/**
 * Utility function to validate entire form
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let hasErrors = false;
  
  Object.keys(validationRules).forEach(field => {
    const rule = validationRules[field];
    const value = formData[field];
    const fieldErrors = rule(value);
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0]; // Take first error
      hasErrors = true;
    }
  });
  
  return { errors, hasErrors };
};

export default {
  VALIDATION_PATTERNS,
  VALIDATION_SIZES,
  VALIDATION_MESSAGES,
  validateField,
  validateUsername,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateBusinessName,
  validateBusinessDescription,
  validateBusinessType,
  validateBusinessAddress,
  validateBusinessPhone,
  validateBusinessEmail,
  validateBusinessWebsite,
  validateRecipeTitle,
  validateRecipeDescription,
  validatePrepTime,
  validateCookTime,
  validateServings,
  validateRating,
  validateMobileNumber,
  validateInventoryName,
  validateProductId,
  validatePrice,
  validateForm
};
