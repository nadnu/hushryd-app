const { executeQuery, executeTransaction } = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.password = data.password; // Include password field
    this.role = data.role;
    // Handle permissions - could be string, array, or null
    try {
      if (data.permissions) {
        this.permissions = typeof data.permissions === 'string' ? JSON.parse(data.permissions) : data.permissions;
      } else {
        this.permissions = null;
      }
    } catch (error) {
      console.error('Error parsing permissions in constructor:', error);
      this.permissions = null;
    }
    this.isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;
    this.lastLogin = data.last_login;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new admin user
  static async create(adminData) {
    const query = `
      INSERT INTO admins (id, email, first_name, last_name, password, role, permissions, is_active, last_login, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      adminData.id,
      adminData.email,
      adminData.firstName,
      adminData.lastName,
      adminData.password, // Include password field
      adminData.role,
      JSON.stringify(adminData.permissions || []),
      adminData.isActive !== undefined ? adminData.isActive : true,
      adminData.lastLogin || null,
      adminData.createdAt || new Date(),
      adminData.updatedAt || new Date()
    ];

    await executeQuery(query, params);
    return await Admin.findById(adminData.id);
  }

  // Find admin by ID
  static async findById(id) {
    const query = 'SELECT * FROM admins WHERE id = ?';
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new Admin(rows[0]) : null;
  }

  // Find admin by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM admins WHERE email = ?';
    const rows = await executeQuery(query, [email]);
    return rows.length > 0 ? new Admin(rows[0]) : null;
  }

  // Get all admins with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    let query = 'SELECT * FROM admins WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await executeQuery(query, params);
    return rows.map(row => new Admin(row));
  }

  // Update admin
  async update(updateData) {
    const allowedFields = ['first_name', 'last_name', 'role', 'permissions', 'is_active', 'last_login'];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        updates.push(`${dbKey} = ?`);
        params.push(dbKey === 'permissions' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(this.id);
    const query = `UPDATE admins SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await executeQuery(query, params);
    return await Admin.findById(this.id);
  }

  // Update last login
  async updateLastLogin() {
    const query = 'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(query, [this.id]);
    return await Admin.findById(this.id);
  }

  // Delete admin
  async delete() {
    const query = 'DELETE FROM admins WHERE id = ?';
    await executeQuery(query, [this.id]);
    return true;
  }

  // Get admin statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as totalAdmins,
        COUNT(CASE WHEN role = 'superadmin' THEN 1 END) as superAdmins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'support' THEN 1 END) as supportAgents,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as activeAdmins,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactiveAdmins
      FROM admins
    `;
    
    const rows = await executeQuery(query);
    return rows[0];
  }

  // Check if admin has permission
  hasPermission(permission) {
    if (!this.permissions) return false;
    const permissions = typeof this.permissions === 'string' ? JSON.parse(this.permissions) : this.permissions;
    return permissions.includes(permission);
  }

  // Convert to JSON (without sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      permissions: this.permissions ? (typeof this.permissions === 'string' ? JSON.parse(this.permissions) : this.permissions) : [],
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Convert to JSON for authentication (includes sensitive data)
  toAuthJSON() {
    let permissions = [];
    try {
      if (this.permissions) {
        permissions = typeof this.permissions === 'string' ? JSON.parse(this.permissions) : this.permissions;
        // Ensure it's an array
        if (!Array.isArray(permissions)) {
          permissions = [];
        }
      }
    } catch (error) {
      console.error('Error parsing permissions:', error);
      permissions = [];
    }

    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      permissions: permissions,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Admin;
