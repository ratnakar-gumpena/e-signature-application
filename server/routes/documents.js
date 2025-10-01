const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { documentValidation, recipientValidation } = require('../utils/validators');

router.get('/', auth, documentController.getAllDocuments);
router.get('/:id', auth, documentController.getDocumentById);
router.post('/', auth, upload.single('file'), documentValidation, documentController.createDocument);
router.put('/:id', auth, documentController.updateDocument);
router.delete('/:id', auth, documentController.deleteDocument);

router.post('/:id/send', auth, recipientValidation, documentController.sendDocument);
router.get('/:id/recipients', auth, documentController.getRecipients);
router.post('/:id/resend', auth, documentController.resendToRecipient);
router.get('/:id/download', auth, documentController.downloadDocument);
router.post('/:id/void', auth, documentController.voidDocument);

module.exports = router;
