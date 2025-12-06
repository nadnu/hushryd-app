const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Helper function to get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'Unknown';
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { deviceType: 'Unknown', deviceName: 'Unknown' };
  
  const ua = userAgent.toLowerCase();
  let deviceType = 'Desktop';
  let deviceName = 'Unknown';

  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'Mobile';
    if (ua.includes('iphone')) deviceName = 'iPhone';
    else if (ua.includes('android')) deviceName = 'Android';
    else deviceName = 'Mobile Device';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'Tablet';
    deviceName = ua.includes('ipad') ? 'iPad' : 'Tablet';
  } else if (ua.includes('windows')) {
    deviceName = 'Windows';
  } else if (ua.includes('mac')) {
    deviceName = 'Mac';
  } else if (ua.includes('linux')) {
    deviceName = 'Linux';
  }

  return { deviceType, deviceName };
};

// Helper function to create session
const createSession = async (userId, userType, token, req) => {
  try {
    const sessionId = uuidv4();
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const { deviceType, deviceName } = parseUserAgent(userAgent);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    await executeQuery(`
      INSERT INTO user_sessions (
        id, user_id, user_type, token, ip_address, user_agent, 
        device_type, device_name, is_active, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      userId,
      userType,
      token.substring(0, 500),
      ipAddress,
      userAgent.substring(0, 500),
      deviceType,
      deviceName,
      true,
      expiresAt
    ]);

    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    // Don't fail login if session creation fails
    return null;
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({
        error: true,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'user' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: true,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await executeQuery(`
      INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      email,
      hashedPassword,
      firstName,
      lastName,
      phone || null,
      role,
      false,
      true
    ]);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userId,
        email: email,
        role: role
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      error: false,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: userId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: role,
          isVerified: false,
          isActive: true
        }
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error during registration'
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        error: true,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await executeQuery(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Create session
    await createSession(user.id, 'user', token, req);

    res.json({
      error: false,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isVerified: user.is_verified,
          isActive: user.is_active
        }
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error during login'
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required'
      });
    }

    // Find admin by email
    const admins = await executeQuery(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    const admin = admins[0];

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({
        error: true,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await executeQuery(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : []
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Create session
    await createSession(admin.id, 'admin', token, req);

    res.json({
      error: false,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
          permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
          isActive: admin.is_active
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error during admin login'
    });
  }
});

// Create Admin User
router.post('/admin/create', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'admin' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: true,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await executeQuery(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existingAdmin.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const adminId = uuidv4();
    await executeQuery(`
      INSERT INTO admins (id, email, password, first_name, last_name, role, permissions, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminId,
      email,
      hashedPassword,
      firstName,
      lastName,
      role,
      JSON.stringify([]),
      true
    ]);

    res.status(201).json({
      error: false,
      message: 'Admin created successfully',
      data: {
        admin: {
          id: adminId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: role,
          isActive: true
        }
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error during admin creation'
    });
  }
});

// Verify Token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    error: false,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

// Change Password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Current password and new password are required'
      });
    }

    // Get user data
    const users = await executeQuery(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await executeQuery(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      error: false,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error during password change'
    });
  }
});

// Logout handler function
const logoutHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers['authorization']?.split(' ')[1] || '';
    
    console.log('Logout requested for user:', userId);
    
    // End all active sessions for this user (or just the current one)
    try {
      await executeQuery(`
        UPDATE user_sessions 
        SET is_active = FALSE, logout_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY login_at DESC
        LIMIT 1
      `, [userId]);
    } catch (sessionError) {
      console.error('Error ending session:', sessionError);
      // Continue with logout even if session update fails
    }
    
    // In a real implementation with Redis/blacklist:
    // You would add the token to a blacklist here
    // For now, just log the logout and return success
    
    // TODO: Add token to blacklist if using Redis
    // await redis.setex(`blacklist:${req.token}`, 3600, '1');
    
    res.json({
      error: false,
      message: 'Logout successful - session destroyed',
      data: {
        userId: userId,
        loggedOutAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: true,
      message: 'Logout failed'
    });
  }
};

// Logout (client-side token removal and session invalidation)
// Support both POST and GET methods for logout
router.post('/logout', authenticateToken, logoutHandler);
router.get('/logout', authenticateToken, logoutHandler);

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await executeQuery(
      'SELECT id, email, first_name, last_name, phone, role, is_verified, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      error: false,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          isVerified: user.is_verified,
          isActive: user.is_active,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// OTP-based Login
// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to mobile number
router.post('/send-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Validate mobile number
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({
        error: true,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if user exists with this mobile number
    const users = await executeQuery(
      'SELECT id, email, first_name, last_name, phone FROM users WHERE phone = ?',
      [mobileNumber]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'No user found with this mobile number. Please register first.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(mobileNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // In production, send SMS via Twilio, AWS SNS, etc.
    console.log(`OTP for ${mobileNumber}: ${otp}`);

    res.json({
      error: false,
      message: 'OTP sent successfully',
      data: {
        mobileNumber: mobileNumber,
        otp: otp, // Include OTP in response for development/testing
        expiresIn: 300 // 5 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    // Validate input
    if (!mobileNumber || !otp) {
      return res.status(400).json({
        error: true,
        message: 'Mobile number and OTP are required'
      });
    }

    // Check if OTP exists in store
    const storedOTP = otpStore.get(mobileNumber);
    
    if (!storedOTP) {
      return res.status(400).json({
        error: true,
        message: 'OTP expired or invalid. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(mobileNumber);
      return res.status(400).json({
        error: true,
        message: 'OTP expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(401).json({
        error: true,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is valid, get user details
    const users = await executeQuery(
      'SELECT id, email, first_name, last_name, phone, role, is_verified FROM users WHERE phone = ?',
      [mobileNumber]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove OTP from store
    otpStore.delete(mobileNumber);

    res.json({
      error: false,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          isVerified: user.is_verified
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

module.exports = router;