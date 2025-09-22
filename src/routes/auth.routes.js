const express = require('express');
const router = express.Router();

const {
  signin,
  signup,
  me,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller.js');

const { auth } = require('../middleware/auth.js');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', auth(), me);
router.put('/profile', auth(), updateProfile);
router.put('/password', auth(), changePassword);

router.get('/verify-email', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
