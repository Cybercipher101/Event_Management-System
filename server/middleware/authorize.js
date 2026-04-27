const AppError = require('../utils/AppError');

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized — please log in', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized to access this resource`, 403));
    }

    next();
  };
};

module.exports = authorize;
