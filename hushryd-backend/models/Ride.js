const { executeQuery, executeTransaction } = require('../config/database');

class Ride {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.driverId = data.driver_id;
    this.fromLocation = data.from_location;
    this.toLocation = data.to_location;
    this.pickupDate = data.pickup_date;
    this.pickupTime = data.pickup_time;
    this.timeslot = data.timeslot;
    this.fare = data.fare;
    this.distance = data.distance;
    this.duration = data.duration;
    this.status = data.status;
    this.paymentStatus = data.payment_status;
    this.paymentMethod = data.payment_method;
    this.notes = data.notes;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new ride
  static async create(rideData) {
    const query = `
      INSERT INTO rides (
        id, user_id, driver_id, from_location, to_location, pickup_date, 
        pickup_time, timeslot, fare, distance, duration, status, 
        payment_status, payment_method, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      rideData.id,
      rideData.userId || null,
      rideData.driverId || null,
      rideData.fromLocation,
      rideData.toLocation,
      rideData.pickupDate,
      rideData.pickupTime,
      rideData.timeslot,
      rideData.fare,
      rideData.distance || null,
      rideData.duration || null,
      rideData.status || 'pending',
      rideData.paymentStatus || 'pending',
      rideData.paymentMethod || null,
      rideData.notes || null
    ];

    await executeQuery(query, params);
    return await Ride.findById(rideData.id);
  }

  // Find ride by ID
  static async findById(id) {
    const query = 'SELECT * FROM rides WHERE id = ?';
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new Ride(rows[0]) : null;
  }

  // Get total count of rides with filters
  static async getTotalCount(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM rides WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }
    if (filters.driverId) {
      query += ' AND driver_id = ?';
      params.push(filters.driverId);
    }
    if (filters.pickupDate) {
      query += ' AND pickup_date = ?';
      params.push(filters.pickupDate);
    }

    const rows = await executeQuery(query, params);
    return rows[0]?.total || 0;
  }

  // Get all rides with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    let query = 'SELECT * FROM rides WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }
    if (filters.driverId) {
      query += ' AND driver_id = ?';
      params.push(filters.driverId);
    }
    if (filters.pickupDate) {
      query += ' AND pickup_date = ?';
      params.push(filters.pickupDate);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await executeQuery(query, params);
    return rows.map(row => new Ride(row));
  }

  // Update ride
  async update(updateData) {
    const allowedFields = [
      'user_id', 'driver_id', 'from_location', 'to_location', 
      'pickup_date', 'pickup_time', 'timeslot', 'fare', 
      'distance', 'duration', 'status', 'payment_status', 
      'payment_method', 'notes'
    ];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        updates.push(`${dbKey} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(this.id);
    const query = `UPDATE rides SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await executeQuery(query, params);
    return await Ride.findById(this.id);
  }

  // Delete ride
  async delete() {
    const query = 'DELETE FROM rides WHERE id = ?';
    await executeQuery(query, [this.id]);
    return true;
  }

  // Get ride statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as totalRides,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingRides,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmedRides,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as inProgressRides,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedRides,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledRides,
        SUM(CASE WHEN status = 'completed' THEN fare ELSE 0 END) as totalRevenue,
        AVG(CASE WHEN status = 'completed' THEN fare ELSE NULL END) as averageFare
      FROM rides
    `;
    
    const rows = await executeQuery(query);
    return rows[0];
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      driverId: this.driverId,
      fromLocation: this.fromLocation,
      toLocation: this.toLocation,
      pickupDate: this.pickupDate,
      pickupTime: this.pickupTime,
      timeslot: this.timeslot,
      fare: this.fare,
      distance: this.distance,
      duration: this.duration,
      status: this.status,
      paymentStatus: this.paymentStatus,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Ride;