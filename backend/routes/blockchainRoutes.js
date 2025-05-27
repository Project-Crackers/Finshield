const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// Endpoint to validate blockchain integrity
router.get('/validate', blockchainController.validateBlockchain);

// Optional alias route
router.get('/status', blockchainController.validateBlockchain);

module.exports = router;
