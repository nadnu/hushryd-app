const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Ride = require('../models/Ride');
const { authenticateToken, authenticateAdmin, authenticateAdminOrUser, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all rides (Admin only)
router.get('/', authenticateAdmin, requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    console.log('📊 Admin requesting rides:', {
      adminId: req.admin?.id,
      adminEmail: req.admin?.email,
      query: req.query
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increased default limit for admin view
    const filters = {
      status: req.query.status,
      userId: req.query.userId,
      driverId: req.query.driverId,
      pickupDate: req.query.pickupDate
    };

    // Get total count for pagination
    const totalCount = await Ride.getTotalCount(filters);
    console.log(`📈 Total rides count: ${totalCount}`);
    
    const rides = await Ride.findAll(page, limit, filters);
    console.log(`✅ Retrieved ${rides.length} rides from database`);
    
    // Convert Ride instances to JSON and parse location data
    const ridesData = rides.map(ride => {
      const rideJson = ride.toJSON();
      
      // Parse location JSON strings if they exist
      try {
        if (typeof rideJson.fromLocation === 'string' && rideJson.fromLocation.trim().startsWith('{')) {
          rideJson.fromLocation = JSON.parse(rideJson.fromLocation);
        }
      } catch (e) {
        // Keep as string if parsing fails
        console.log('⚠️ Failed to parse fromLocation:', rideJson.fromLocation);
      }
      
      try {
        if (typeof rideJson.toLocation === 'string' && rideJson.toLocation.trim().startsWith('{')) {
          rideJson.toLocation = JSON.parse(rideJson.toLocation);
        }
      } catch (e) {
        // Keep as string if parsing fails
        console.log('⚠️ Failed to parse toLocation:', rideJson.toLocation);
      }
      
      return rideJson;
    });
    
    console.log(`📤 Sending ${ridesData.length} rides to frontend`);
    
    res.json({
      error: false,
      message: 'Rides retrieved successfully',
      data: {
        rides: ridesData || [],
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get rides error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get ride by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({
        error: true,
        message: 'Ride not found'
      });
    }

    // Users can only view their own rides unless they're admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.id !== ride.userId) {
      return res.status(403).json({
        error: true,
        message: 'Access denied'
      });
    }

    res.json({
      error: false,
      message: 'Ride retrieved successfully',
      data: {
        ride: ride.toJSON()
      }
    });

  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Create new ride (Admin or User)
router.post('/', authenticateAdminOrUser, async (req, res) => {
  try {
    // Verify authentication succeeded
    if (!req.admin && !req.user) {
      console.error('❌ No authentication found in request');
      return res.status(401).json({
        error: true,
        message: 'Authentication required'
      });
    }

    const { 
      fromLocation, 
      toLocation, 
      pickupDate, 
      pickupTime, 
      timeslot, 
      fare, 
      distance, 
      duration, 
      notes,
      userId  // Allow admin to specify userId, otherwise use authenticated user/admin
    } = req.body;

    if (!fromLocation || !toLocation || !pickupDate || !pickupTime || !timeslot || !fare) {
      return res.status(400).json({
        error: true,
        message: 'From location, to location, pickup date, pickup time, timeslot, and fare are required'
      });
    }

    console.log('🚗 Ride creation request:', {
      isAdmin: !!req.admin,
      isUser: !!req.user,
      adminId: req.admin?.id,
      userId: req.user?.id,
      body: req.body
    });

    // Determine userId: 
    // 1. Use provided userId if specified
    // 2. Use authenticated user's id if it's a user request
    // 3. Allow null for admin-created rides (admin can create rides without a specific user)
    let rideUserId = userId || (req.user ? req.user.id : null);
    
    // Regular users must have a userId (their own)
    if (!rideUserId && !req.admin) {
      return res.status(400).json({
        error: true,
        message: 'User ID is required for ride creation'
      });
    }
    
    // Log who is creating the ride
    if (req.admin) {
      console.log('👤 Admin creating ride:', {
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        specifiedUserId: userId || 'none (admin-created)'
      });
    } else {
      console.log('👤 User creating ride:', {
        userId: req.user.id,
        userEmail: req.user.email
      });
    }

    // Prepare location data - can be string or object
    const fromLocationData = typeof fromLocation === 'string' 
      ? fromLocation 
      : JSON.stringify(fromLocation);
    const toLocationData = typeof toLocation === 'string'
      ? toLocation
      : JSON.stringify(toLocation);

    const rideData = {
      id: uuidv4(),
      userId: rideUserId,
      driverId: req.body.driverId || null, // Allow specifying driver
      fromLocation: fromLocationData,
      toLocation: toLocationData,
      pickupDate,
      pickupTime,
      timeslot,
      fare: parseFloat(fare),
      distance: distance ? parseFloat(distance) : null,
      duration: duration ? parseInt(duration) : null,
      notes: notes || null,
      status: req.body.status || 'pending', // Allow admin to set initial status
      paymentStatus: req.body.paymentStatus || 'pending'
    };

    console.log('📝 Ride data to be created:', rideData);

    let newRide;
    try {
      newRide = await Ride.create(rideData);
      console.log('✅ Ride created in database:', newRide.id);
    } catch (dbError) {
      console.error('❌ Database error creating ride:', dbError);
      console.error('Database error stack:', dbError.stack);
      console.error('Ride data that failed:', rideData);
      return res.status(500).json({
        error: true,
        message: 'Failed to create ride in database',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    // Parse location data in response
    let rideJson;
    try {
      rideJson = newRide.toJSON();
      // Parse location JSON strings if they exist
      try {
        if (typeof rideJson.fromLocation === 'string' && rideJson.fromLocation.trim().startsWith('{')) {
          rideJson.fromLocation = JSON.parse(rideJson.fromLocation);
        }
      } catch (e) {
        console.log('⚠️ Failed to parse fromLocation, keeping as string');
        // Keep as string if parsing fails
      }
      try {
        if (typeof rideJson.toLocation === 'string' && rideJson.toLocation.trim().startsWith('{')) {
          rideJson.toLocation = JSON.parse(rideJson.toLocation);
        }
      } catch (e) {
        console.log('⚠️ Failed to parse toLocation, keeping as string');
        // Keep as string if parsing fails
      }
    } catch (jsonError) {
      console.error('❌ Error converting ride to JSON:', jsonError);
      return res.status(500).json({
        error: true,
        message: 'Failed to process ride data',
        details: process.env.NODE_ENV === 'development' ? jsonError.message : undefined
      });
    }

    console.log('✅ Ride created successfully:', newRide.id);

    res.status(201).json({
      error: false,
      message: 'Ride created successfully',
      data: {
        ride: rideJson
      }
    });

  } catch (error) {
    console.error('❌ Create ride error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update ride
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({
        error: true,
        message: 'Ride not found'
      });
    }

    // Users can only update their own rides unless they're admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.id !== ride.userId) {
      return res.status(403).json({
        error: true,
        message: 'Access denied'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['fromLocation', 'toLocation', 'pickupDate', 'pickupTime', 'timeslot', 'fare', 'notes'];
    const updateData = {};
    
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedUpdates.includes(key)) {
        updateData[key] = value;
      }
    }

    // Admins can also update status and payment status
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.paymentStatus) updateData.paymentStatus = req.body.paymentStatus;
      if (req.body.driverId) updateData.driverId = req.body.driverId;
    }

    const updatedRide = await ride.update(updateData);

    res.json({
      error: false,
      message: 'Ride updated successfully',
      data: {
        ride: updatedRide.toJSON()
      }
    });

  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Delete ride (Admin only)
router.delete('/:id', authenticateAdmin, requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({
        error: true,
        message: 'Ride not found'
      });
    }

    await ride.delete();

    res.json({
      error: false,
      message: 'Ride deleted successfully'
    });

  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

// Get ride statistics (Admin only)
router.get('/stats/overview', authenticateAdmin, requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    console.log('📊 Admin requesting ride stats:', {
      adminId: req.admin?.id,
      adminEmail: req.admin?.email
    });

    const stats = await Ride.getStats();
    console.log('✅ Ride stats retrieved:', stats);

    // Ensure all stats fields are numbers
    const formattedStats = {
      totalRides: parseInt(stats.totalRides) || 0,
      pendingRides: parseInt(stats.pendingRides) || 0,
      confirmedRides: parseInt(stats.confirmedRides) || 0,
      completedRides: parseInt(stats.completedRides) || 0,
      cancelledRides: parseInt(stats.cancelledRides) || 0,
      inProgressRides: parseInt(stats.inProgressRides) || 0,
      totalRevenue: parseFloat(stats.totalRevenue) || 0,
      averageFare: parseFloat(stats.averageFare) || 0
    };

    res.json({
      error: false,
      message: 'Ride statistics retrieved successfully',
      data: {
        stats: formattedStats
      }
    });

  } catch (error) {
    console.error('❌ Get ride stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;