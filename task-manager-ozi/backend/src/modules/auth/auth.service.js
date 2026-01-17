const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/ApiError');
const User = require('../user/user.model');
const { jwt: jwtConfig } = require('../../config/env');

const createTokens = (userId) => {
  if (!jwtConfig.accessSecret || !jwtConfig.refreshSecret) {
    throw new ApiError(500, 'JWT secrets are not configured on the server')
  }
  try {
    const access = jwt.sign({ sub: userId }, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiry });
    const refresh = jwt.sign({ sub: userId }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiry });
    return { access, refresh };
  } catch (err) {
    throw new ApiError(500, 'Failed to generate JWT tokens')
  }
};

async function register(payload) {
  const exists = await User.findOne({ email: payload.email });
  if (exists) throw new ApiError(409, 'Email already registered');
  const hashed = await bcrypt.hash(payload.password, 10);
  const user = await User.create({ name: payload.name, email: payload.email, password: hashed });
  const tokens = createTokens(user._id);
  user.refreshTokens.push(tokens.refresh);
  await user.save();
  return { user: { id: user._id, name: user.name, email: user.email }, tokens };
}

async function login(payload) {
  const user = await User.findOne({ email: payload.email });
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const valid = await bcrypt.compare(payload.password, user.password);
  if (!valid) throw new ApiError(401, 'Invalid credentials');
  const tokens = createTokens(user._id);
  user.refreshTokens.push(tokens.refresh);
  await user.save();
  return { user: { id: user._id, name: user.name, email: user.email }, tokens };
}

async function refresh(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'Invalid refresh token');
    const found = user.refreshTokens.find((t) => t === refreshToken);
    if (!found) throw new ApiError(401, 'Refresh token revoked');
    const tokens = createTokens(user._id);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(tokens.refresh);
    await user.save();
    return { access: tokens.access, refresh: tokens.refresh };
  } catch (err) {
    throw new ApiError(401, 'Invalid refresh token');
  }
}

async function logout(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await User.findById(payload.sub);
    if (!user) return;
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    await user.save();
  } catch (err) {}
}

module.exports = { register, login, refresh, logout };
