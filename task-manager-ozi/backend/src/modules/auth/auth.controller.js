const { registerSchema, loginSchema } = require('./auth.schema');
const ApiError = require('../../utils/ApiError');
const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

async function register(req, res, next) {
  try {
    // log incoming payload for debugging
    // eslint-disable-next-line no-console
    console.log('auth.register payload:', req.body);
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({ path: e.path, message: e.message }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    const dto = parsed.data;
    const result = await authService.register(dto);
    // Set refresh token as HttpOnly cookie for subsequent refresh calls
    res.cookie('refreshToken', result.tokens.refresh, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    res.status(201).json(new ApiResponse({ data: result }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('auth.register error:', err && err.stack ? err.stack : err);
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({ path: e.path, message: e.message }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    const dto = parsed.data;
    const result = await authService.login(dto);
    res.cookie('refreshToken', result.tokens.refresh, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    res.json(new ApiResponse({ data: { user: result.user, access: result.tokens.access } }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('auth.login error:', err && err.stack ? err.stack : err);
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) return res.status(401).json({ status: 'error', message: 'No refresh token' });
    const tokens = await authService.refresh(refreshToken);
    res.cookie('refreshToken', tokens.refresh, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    return res.json(new ApiResponse({ data: { access: tokens.access } }));
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.cookies || {};
    if (refreshToken) await authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return res.json(new ApiResponse({ data: null, message: 'Logged out' }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, logout };
