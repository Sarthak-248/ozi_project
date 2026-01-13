const express = require('express');
const controller = require('./task.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(auth);

// CRUD operations
router.post('/', controller.create);
router.get('/', controller.list);
router.get('/stats/overview', controller.getStats);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
