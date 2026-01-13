const express = require('express');
const controller = require('./user.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', auth, controller.profile);
router.patch('/me', auth, controller.update);
router.post('/me/profile-picture', auth, controller.uploadProfilePicture);
router.post('/me/change-password', auth, controller.changePassword);
router.delete('/me', auth, controller.remove);

module.exports = router;
