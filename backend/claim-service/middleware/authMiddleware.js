const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware for Claim Service:
 * Verifies JWT token from Authorization header (Bearer <token>)
 * Attaches decoded user payload ({ id, name, email, role }) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    req.authToken = token; // Store raw token for service-to-service forwarding if needed
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
    });
  }
};

/**
 * Authorization Middleware for Claim Service:
 * Verifies that the authenticated user has one of the required roles.
 * Must be mounted after the `protect` middleware.
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'user')
 */
const authorize = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    // Safely handle missing req.user (e.g. if protect was omitted)
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access denied. User authentication required.',
      });
    }

    // Check if user has one of the allowed roles
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role || 'unknown'}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
