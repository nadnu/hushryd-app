const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Authenticate user token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Authentication check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      endpoint: req.path
    });

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    console.log('✅ Token verified. User ID:', decoded.id);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('❌ User not found in database for ID:', decoded.id);
      return res.status(401).json({
        error: true,
        message: 'Invalid token - user not found'
      });
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      isActive: user.isActive
    });

    // Check if user is active
    if (!user.isActive) {
      console.error('❌ User account is deactivated:', user.id);
      return res.status(401).json({
        error: true,
        message: 'Account is deactivated'
      });
    }

    req.user = user.toJSON();
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: true,
      message: 'Authentication error'
    });
  }
};

// Authenticate admin token
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // Get admin from database
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token - admin not found'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        error: true,
        message: 'Account is deactivated'
      });
    }

    req.admin = admin.toAuthJSON();
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }

    console.error('Admin authentication error:', error);
    return res.status(500).json({
      error: true,
      message: 'Authentication error'
    });
  }
};

// Check admin role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: true,
        message: 'Admin authentication required'
      });
    }

    const userRole = req.admin.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: true,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check admin permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: true,
        message: 'Admin authentication required'
      });
    }

    const admin = new Admin(req.admin);
    if (!admin.hasPermission(permission)) {
      return res.status(403).json({
        error: true,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Authenticate either admin or user token
const authenticateAdminOrUser = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 authenticateAdminOrUser - Token check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      endpoint: req.path
    });

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      console.log('✅ Token verified. ID:', decoded.id);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: true,
          message: 'Token has expired'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: true,
          message: 'Invalid token'
        });
      }
      throw jwtError;
    }
    
    // Try to authenticate as admin first
    try {
      const admin = await Admin.findById(decoded.id);
      if (admin) {
        // Check if admin is active (handle both boolean and 0/1 values)
        const isActive = admin.isActive === true || admin.isActive === 1 || admin.isActive === '1';
        if (!isActive) {
          console.error('❌ Admin account is deactivated:', admin.id);
          return res.status(401).json({
            error: true,
            message: 'Admin account is deactivated'
          });
        }
        req.admin = admin.toAuthJSON();
        req.user = null; // Clear user if admin is found
        console.log('✅ Authenticated as admin:', {
          id: admin.id,
          email: admin.email,
          role: admin.role
        });
        return next();
      }
    } catch (adminError) {
      console.error('❌ Error checking admin:', adminError);
      console.error('Admin error stack:', adminError.stack);
      // Continue to check user
    }

    // If not admin, try to authenticate as user
    try {
      const user = await User.findById(decoded.id);
      if (user) {
        // Check if user is active (handle both boolean and 0/1 values)
        const isActive = user.isActive === true || user.isActive === 1 || user.isActive === '1';
        if (!isActive) {
          console.error('❌ User account is deactivated:', user.id);
          return res.status(401).json({
            error: true,
            message: 'User account is deactivated'
          });
        }
        req.user = user.toJSON();
        req.admin = null; // Clear admin if user is found
        console.log('✅ Authenticated as user:', {
          id: user.id,
          email: user.email
        });
        return next();
      }
    } catch (userError) {
      console.error('❌ Error checking user:', userError);
      console.error('User error stack:', userError.stack);
    }

    // Neither admin nor user found
    console.error('❌ Neither admin nor user found for ID:', decoded.id);
    return res.status(401).json({
      error: true,
      message: 'Invalid token - user or admin not found'
    });

  } catch (error) {
    console.error('❌ authenticateAdminOrUser error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: true,
      message: 'Authentication error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  authenticateAdminOrUser,
  requireRole,
  requirePermission
};
