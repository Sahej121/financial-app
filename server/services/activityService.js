const Activity = require('../models/Activity');
const { getIO } = require('../config/socketConfig');

class ActivityService {
  static async logActivity(data) {
    try {
      const activity = new Activity({
        user: data.userId,
        userType: data.userType,
        type: data.type,
        description: data.description,
        metadata: data.metadata || {}
      });

      await activity.save();

      // Emit real-time update
      const io = getIO();
      io.to(`user_${data.userId}`).emit('activity_update', activity);

      if (data.metadata?.clientId) {
        io.to(`client_${data.metadata.clientId}`).emit('activity_update', activity);
      }

      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  static async getActivities(userId, userType, filters = {}) {
    try {
      const query = { user: userId, userType };

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }
}

module.exports = ActivityService; 