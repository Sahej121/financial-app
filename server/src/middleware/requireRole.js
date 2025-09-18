const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (should be done by auth middleware first)
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user's role is in the allowed roles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          current: req.user.role 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

module.exports = requireRole;