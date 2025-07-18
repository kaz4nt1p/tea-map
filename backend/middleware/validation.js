const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} source - Where to get data from (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        message: 'The provided data is invalid',
        details: errors
      });
    }
    
    // Replace request data with validated/sanitized data
    req[source] = value;
    next();
  };
};

// User registration validation schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .max(255)
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required'
    }),
  
  display_name: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Display name must not exceed 50 characters'
    }),
  
  bio: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bio must not exceed 500 characters'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Activity creation validation schema
const createActivitySchema = Joi.object({
  spot_id: Joi.string()
    .optional()
    .allow(null),
  
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow(''),
  
  tea_type: Joi.string()
    .max(100)
    .optional()
    .allow(''),
  
  tea_details: Joi.object()
    .optional(),
  
  mood_before: Joi.string()
    .max(100)
    .optional()
    .allow(''),
  
  mood_after: Joi.string()
    .max(100)
    .optional()
    .allow(''),
  
  taste_notes: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  insights: Joi.string()
    .max(1000)
    .optional()
    .allow(''),
  
  duration_minutes: Joi.number()
    .integer()
    .min(1)
    .max(1440) // 24 hours
    .optional(),
  
  weather_conditions: Joi.string()
    .max(200)
    .optional()
    .allow(''),
  
  companions: Joi.array()
    .items(Joi.string())
    .optional(),
  
  privacy_level: Joi.string()
    .valid('public', 'friends', 'private')
    .default('public')
});

// Spot creation validation schema
const createSpotSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Spot name cannot be empty',
      'string.max': 'Spot name must not exceed 200 characters',
      'any.required': 'Spot name is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  long_description: Joi.string()
    .max(2000)
    .optional()
    .allow(''),
  
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  
  address: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  amenities: Joi.array()
    .items(Joi.string())
    .optional(),
  
  accessibility_info: Joi.string()
    .max(1000)
    .optional()
    .allow(''),
  
  image_url: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    })
});

// Comment creation validation schema
const createCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment must not exceed 1000 characters',
      'any.required': 'Comment content is required'
    })
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createActivitySchema,
  createSpotSchema,
  createCommentSchema
};