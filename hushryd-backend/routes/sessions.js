const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Custom authentication middleware that works with both users and admins
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: true,
        message: 'Invalid or expired token'
      });
    }
    req.user = decoded;
    next();
  });
};

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

// Create a new session (called on login)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role === 'superadmin' || req.user.role === 'admin' || req.user.role === 'support' || req.user.role === 'manager' ? 'admin' : 'user';
    const token = req.headers['authorization']?.split(' ')[1] || '';
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const { deviceType, deviceName } = parseUserAgent(userAgent);
    
    const sessionId = uuidv4();
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
      token.substring(0, 500), // Limit token length
      ipAddress,
      userAgent.substring(0, 500), // Limit user agent length
      deviceType,
      deviceName,
      true,
      expiresAt
    ]);

    res.json({
      error: false,
      message: 'Session created successfully',
      data: { sessionId }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create session'
    });
  }
});

// Get all sessions for the authenticated user
router.get('/my-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await executeQuery(`
      SELECT 
        id, user_id, user_type, ip_address, user_agent,
        device_type, device_name, location,
        login_at, logout_at, last_activity,
        is_active, expires_at, created_at
      FROM user_sessions
      WHERE user_id = ?
      ORDER BY login_at DESC
      LIMIT 100
    `, [userId]);

    res.json({
      error: false,
      message: 'Sessions retrieved successfully',
      data: { sessions }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch sessions'
    });
  }
});

// Get all user sessions (Admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user.role;
    if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId, userType, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        s.id, s.user_id, s.user_type, s.ip_address, s.user_agent,
        s.device_type, s.device_name, s.location,
        s.login_at, s.logout_at, s.last_activity,
        s.is_active, s.expires_at, s.created_at,
        u.email as user_email, u.first_name, u.last_name
      FROM user_sessions s
      LEFT JOIN users u ON s.user_id = u.id AND s.user_type = 'user'
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND s.user_id = ?';
      params.push(userId);
    }

    if (userType) {
      query += ' AND s.user_type = ?';
      params.push(userType);
    }

    query += ' ORDER BY s.login_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const sessions = await executeQuery(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM user_sessions s
      WHERE 1=1
    `;
    const countParams = [];

    if (userId) {
      countQuery += ' AND s.user_id = ?';
      countParams.push(userId);
    }

    if (userType) {
      countQuery += ' AND s.user_type = ?';
      countParams.push(userType);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      error: false,
      message: 'Sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch sessions'
    });
  }
});

// Get sessions for a specific user (Admin only)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user.role;
    if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const sessions = await executeQuery(`
      SELECT 
        s.id, s.user_id, s.user_type, s.ip_address, s.user_agent,
        s.device_type, s.device_name, s.location,
        s.login_at, s.logout_at, s.last_activity,
        s.is_active, s.expires_at, s.created_at,
        u.email as user_email, u.first_name, u.last_name
      FROM user_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
      ORDER BY s.login_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM user_sessions WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0]?.total || 0;

    res.json({
      error: false,
      message: 'User sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch user sessions'
    });
  }
});

// End a session (logout)
router.post('/end/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify session belongs to user or user is admin
    const sessions = await executeQuery(
      'SELECT user_id FROM user_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Session not found'
      });
    }

    const userRole = req.user.role;
    if (sessions[0].user_id !== userId && userRole !== 'superadmin' && userRole !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied'
      });
    }

    await executeQuery(`
      UPDATE user_sessions 
      SET is_active = FALSE, logout_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [sessionId]);

    res.json({
      error: false,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to end session'
    });
  }
});

// Get session statistics (Admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user.role;
    if (userRole !== 'superadmin' && userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_sessions,
        COUNT(CASE WHEN user_type = 'user' THEN 1 END) as user_sessions,
        COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admin_sessions,
        COUNT(CASE WHEN DATE(login_at) = CURDATE() THEN 1 END) as today_logins,
        COUNT(CASE WHEN DATE(login_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as week_logins,
        COUNT(CASE WHEN DATE(login_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as month_logins
      FROM user_sessions
    `);

    res.json({
      error: false,
      message: 'Session statistics retrieved successfully',
      data: { stats: stats[0] }
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch session statistics'
    });
  }
});

module.exports = router;

