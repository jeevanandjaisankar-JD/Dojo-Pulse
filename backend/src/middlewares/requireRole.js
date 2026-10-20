
const requireRole = (...allowedRoles) => (req, res, next) => {
  // Legacy Mentor accounts and User-based mentor accounts
  // are marked as mentors by authMiddleware.
  const role = req.mentor ? 'mentor' : req.user?.role;

  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.'
    });
  }

  return next();
};

module.exports = requireRole;
