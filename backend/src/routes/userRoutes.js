const express = require('express');
const router = express.Router();
const { uploadKyc } = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/kyc-upload', authenticate, upload.array('documents', 5), uploadKyc);

module.exports = router;

