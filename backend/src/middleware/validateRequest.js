const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request using express-validator
 */
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ApiError(400, 'Validation Error', errors.array());
    return next(error);
  }
  next();
};

/**
 * Middleware to validate MongoDB ObjectId
 */
exports.validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const error = new ApiError(400, 'Invalid ID format');
    return next(error);
  }
  next();
};

/**
 * Middleware to validate pagination parameters
 */
exports.validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    const error = new ApiError(400, 'Invalid page number');
    return next(error);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    const error = new ApiError(400, 'Invalid limit value');
    return next(error);
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };

  next();
};

/**
 * Middleware to validate sorting parameters
 */
exports.validateSorting = (req, res, next) => {
  const { sortBy, order = 'asc' } = req.query;
  const allowedFields = ['createdAt', 'updatedAt', 'price', 'name'];
  const allowedOrders = ['asc', 'desc'];

  if (sortBy && !allowedFields.includes(sortBy)) {
    const error = new ApiError(400, 'Invalid sort field');
    return next(error);
  }

  if (!allowedOrders.includes(order.toLowerCase())) {
    const error = new ApiError(400, 'Invalid sort order');
    return next(error);
  }

  req.sorting = {
    sortBy: sortBy || 'createdAt',
    order: order.toLowerCase()
  };

  next();
};

/**
 * Middleware to validate filtering parameters
 */
exports.validateFiltering = (req, res, next) => {
  const { minPrice, maxPrice, category, status } = req.query;
  const filters = {};

  if (minPrice) {
    const min = parseFloat(minPrice);
    if (isNaN(min) || min < 0) {
      const error = new ApiError(400, 'Invalid minimum price');
      return next(error);
    }
    filters.minPrice = min;
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (isNaN(max) || max < 0) {
      const error = new ApiError(400, 'Invalid maximum price');
      return next(error);
    }
    filters.maxPrice = max;
  }

  if (minPrice && maxPrice && filters.minPrice > filters.maxPrice) {
    const error = new ApiError(400, 'Minimum price cannot be greater than maximum price');
    return next(error);
  }

  if (category) {
    filters.category = category;
  }

  if (status) {
    const allowedStatuses = ['active', 'inactive', 'pending'];
    if (!allowedStatuses.includes(status)) {
      const error = new ApiError(400, 'Invalid status');
      return next(error);
    }
    filters.status = status;
  }

  req.filters = filters;
  next();
}; 