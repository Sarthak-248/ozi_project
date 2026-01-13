const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { jwt: jwtConfig } = require('../config/env');
const User = require('../modules/user/user.model');

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return next(new ApiError(401, 'Authentication required'));
  const token = auth.split(' ')[1];
  try {
    if (!jwtConfig.accessSecret) {
      return next(new ApiError(500, 'JWT_ACCESS_SECRET not configured'));
    }
    const payload = jwt.verify(token, jwtConfig.accessSecret);
    const user = await User.findById(payload.sub).select('-password -refreshTokens');
    if (!user) return next(new ApiError(401, 'User not found'));
    req.user = user;
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = authMiddleware;
