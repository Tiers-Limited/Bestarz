const express = require('express');
const router = express.Router();

const {
  createReview,
  getMyReviews,
  getProviderReviews,
  updateReview,
  deleteReview
} = require('../controllers/review.controller.js');

const { auth } = require('../middleware/auth.js');

router.get('/me', auth(['client', 'provider']), getMyReviews);
router.post('/', auth('client'), createReview);
router.get('/provider/:providerId', getProviderReviews);
router.put('/:id', auth(), updateReview);
router.delete('/:id', auth(), deleteReview);

module.exports = router;
