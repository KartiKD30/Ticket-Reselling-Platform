const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

const adminOnly = (req, res, next) => {
  if (!req.userRole || req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.userRole || req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = {
  verifyToken,
  auth,
  requireRole,
  adminOnly,
  requireAdmin
};
