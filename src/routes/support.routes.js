const express = require('express');
const router = express.Router();

const { sendSupportRequest } = require('../controllers/support.controller.js');

router.post('/', sendSupportRequest);

module.exports = router;
