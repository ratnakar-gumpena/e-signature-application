const crypto = require('crypto');

const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress;
};

const isExpired = (expirationDate) => {
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
};

const sanitizeUser = (user) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

module.exports = {
  generateToken,
  getClientIp,
  isExpired,
  sanitizeUser
};
