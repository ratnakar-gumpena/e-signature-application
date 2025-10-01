const express = require('express');
const router = express.Router();
const signatureController = require('../controllers/signatureController');
const { signatureValidation } = require('../utils/validators');

router.get('/:token', signatureController.getDocumentForSigning);
router.post('/:token', signatureValidation, signatureController.submitSignature);
router.get('/:token/status', signatureController.getSigningStatus);

module.exports = router;
