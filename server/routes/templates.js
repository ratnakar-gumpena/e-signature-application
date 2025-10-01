const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { templateValidation, placementValidation } = require('../utils/validators');

router.get('/', auth, templateController.getAllTemplates);
router.get('/:id', auth, templateController.getTemplateById);
router.post('/', auth, upload.single('file'), templateController.createTemplate);
router.put('/:id', auth, templateValidation, templateController.updateTemplate);
router.delete('/:id', auth, templateController.deleteTemplate);

router.get('/:id/placements', auth, templateController.getPlacements);
router.post('/:id/placements', auth, placementValidation, templateController.createPlacements);
router.put('/:id/placements/:placementId', auth, templateController.updatePlacement);
router.delete('/:id/placements/:placementId', auth, templateController.deletePlacement);

module.exports = router;
