const express = require('express');
const controller = require('./auth.controller');

const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

// Return current authenticated user
if (typeof authMiddleware !== 'function') {
	throw new Error('authMiddleware is not a function or failed to load')
}
if (typeof controller.me !== 'function') {
	throw new Error('auth.controller.me is not a function or failed to load')
}
router.get('/me', authMiddleware, controller.me);

module.exports = router;
