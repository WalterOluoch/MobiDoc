const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getConsultation,
  getMyConsultations,
  updateConsultationStatus,
  getConsultationMessages,
} = require('../controllers/consultationController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, createConsultation);
router.get('/my', authenticate, getMyConsultations);
router.get('/:id', authenticate, getConsultation);
router.patch('/:id/status', authenticate, updateConsultationStatus);
router.get('/:id/messages', authenticate, getConsultationMessages);

module.exports = router;

