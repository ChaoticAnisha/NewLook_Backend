const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden" });
    }
    next();
  };
};

module.exports = roleAuth;
