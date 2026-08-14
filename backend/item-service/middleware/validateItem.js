const mongoose = require('mongoose');

const VALID_CATEGORIES = [
  'Electronics',
  'Wallets & Bags',
  'Keys',
  'Jewelry & Watches',
  'Documents & IDs',
  'Clothing & Accessories',
  'Pets',
  'Other',
];

const VALID_STATUSES = [
  'searching',
  'pending_match',
  'matched',
  'claimed',
  'returned',
  'resolved',
];

/**
 * Validation Middleware for creating a lost-item report.
 * Validates all required and optional fields, sanitizes inputs,
 * and ensures user identity is NEVER overridden from the request body.
 */
const validateLostItem = (req, res, next) => {
  // Strip any attempts by client to spoof userId, reporterName, or reporterEmail
  delete req.body.userId;
  delete req.body.reporterName;
  delete req.body.reporterEmail;
  delete req.body._id;

  const { title, category, description, location, dateLost } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Item title/name is required');
  } else if (title.trim().length > 120) {
    errors.push('Item title cannot exceed 120 characters');
  }

  if (!category || typeof category !== 'string' || !VALID_CATEGORIES.includes(category.trim())) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Detailed description is required');
  } else if (description.trim().length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  if (!location || typeof location !== 'string' || !location.trim()) {
    errors.push('Last seen location is required');
  } else if (location.trim().length > 200) {
    errors.push('Location cannot exceed 200 characters');
  }

  if (!dateLost) {
    errors.push('Date and time lost is required');
  } else {
    const parsedDate = new Date(dateLost);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Please provide a valid date/time for when the item was lost');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validation Middleware for updating an existing item report.
 * Validates fields if present, sanitizes spoof attempts, and validates ID.
 */
const validateUpdateItem = (req, res, next) => {
  // Check if param ID is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid item report ID format',
    });
  }

  // Strip any spoofed user identity properties
  delete req.body.userId;
  delete req.body.reporterName;
  delete req.body.reporterEmail;
  delete req.body._id;

  const { title, category, description, location, dateLost, status } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      errors.push('Item title/name cannot be empty');
    } else if (title.trim().length > 120) {
      errors.push('Item title cannot exceed 120 characters');
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category.trim())) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) {
      errors.push('Detailed description cannot be empty');
    } else if (description.trim().length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }
  }

  if (location !== undefined) {
    if (typeof location !== 'string' || !location.trim()) {
      errors.push('Location cannot be empty');
    } else if (location.trim().length > 200) {
      errors.push('Location cannot exceed 200 characters');
    }
  }

  if (dateLost !== undefined) {
    const parsedDate = new Date(dateLost);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Please provide a valid date/time');
    }
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status.toLowerCase())) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  VALID_CATEGORIES,
  VALID_STATUSES,
  validateLostItem,
  validateUpdateItem,
};

