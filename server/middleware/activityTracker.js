const ActivityService = require('../services/activityService');

const trackActivity = (type, descriptionFormatter) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function(data) {
      if (data.success) {
        try {
          await ActivityService.logActivity({
            userId: req.user.id,
            userType: req.user.type,
            type: type,
            description: descriptionFormatter(req, data),
            metadata: {
              ...data.metadata,
              clientId: data.clientId || req.body.clientId
            }
          });
        } catch (error) {
          console.error('Error tracking activity:', error);
        }
      }
      
      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = trackActivity; 