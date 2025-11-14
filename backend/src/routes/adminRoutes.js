const express = require('express');
const router = express.Router();
const { getPendingDoctors, reviewDoctor } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/doctors', authenticate, authorize('admin'), getPendingDoctors);
router.patch('/doctors/:id', authenticate, authorize('admin'), reviewDoctor);

module.exports = router;

