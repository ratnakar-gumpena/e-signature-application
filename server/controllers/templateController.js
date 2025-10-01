const Template = require('../models/Template');
const SignaturePlacement = require('../models/SignaturePlacement');
const s3Service = require('../services/s3Service');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TemplateController {
  async getAllTemplates(req, res, next) {
    try {
      const { status } = req.query;
      const filters = {};
      if (status) filters.status = status;

      const templates = await Template.findByUserId(req.user.id, filters);
      res.json({ templates });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req, res, next) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ template });
    } catch (error) {
      next(error);
    }
  }

  async createTemplate(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      const { name, description, status } = req.body;
      const fileKey = `templates/${req.user.id}/${uuidv4()}/${req.file.originalname}`;

      const fileUrl = await s3Service.uploadFile(req.file.path, fileKey);

      const template = await Template.create({
        userId: req.user.id,
        name: name || req.file.originalname,
        description,
        fileUrl,
        thumbnailUrl: null,
        status: status || 'draft'
      });

      res.status(201).json({ template });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedTemplate = await Template.update(id, req.user.id, {
        name: name || template.name,
        description: description !== undefined ? description : template.description,
        status: status || template.status
      });

      res.json({ template: updatedTemplate });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Template.delete(id, req.user.id);

      try {
        const fileKey = s3Service.extractKeyFromUrl(template.file_url);
        await s3Service.deleteFile(fileKey);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getPlacements(req, res, next) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const placements = await SignaturePlacement.findByTemplateId(id);
      res.json({ placements });
    } catch (error) {
      next(error);
    }
  }

  async createPlacements(req, res, next) {
    try {
      const { id } = req.params;
      const placements = req.body;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!Array.isArray(placements) || placements.length === 0) {
        return res.status(400).json({ error: 'Placements array is required' });
      }

      await SignaturePlacement.deleteByTemplateId(id);
      const createdPlacements = await SignaturePlacement.createMultiple(id, placements);

      res.status(201).json({ placements: createdPlacements });
    } catch (error) {
      next(error);
    }
  }

  async updatePlacement(req, res, next) {
    try {
      const { id, placementId } = req.params;
      const placement = await SignaturePlacement.findById(placementId);

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      const template = await Template.findById(id);
      if (!template || template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedPlacement = await SignaturePlacement.update(placementId, req.body);
      res.json({ placement: updatedPlacement });
    } catch (error) {
      next(error);
    }
  }

  async deletePlacement(req, res, next) {
    try {
      const { id, placementId } = req.params;
      const placement = await SignaturePlacement.findById(placementId);

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      const template = await Template.findById(id);
      if (!template || template.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await SignaturePlacement.delete(placementId);
      res.json({ message: 'Placement deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TemplateController();
