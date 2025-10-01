const Document = require('../models/Document');
const Template = require('../models/Template');
const SignaturePlacement = require('../models/SignaturePlacement');
const s3Service = require('../services/s3Service');
const emailService = require('../services/emailService');
const { generateToken, isExpired } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

class DocumentController {
  async getAllDocuments(req, res, next) {
    try {
      const { status } = req.query;
      const filters = {};
      if (status) filters.status = status;

      const documents = await Document.findByUserId(req.user.id, filters);
      res.json({ documents });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const recipients = await Document.getRecipients(id);
      res.json({ document, recipients });
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req, res, next) {
    try {
      const { templateId, title, message, expirationDate } = req.body;

      let template = null;
      let fileUrl = null;

      if (templateId) {
        template = await Template.findById(templateId);
        if (!template || template.user_id !== req.user.id) {
          return res.status(404).json({ error: 'Template not found' });
        }
        fileUrl = template.file_url;
      } else if (req.file) {
        const fileKey = `documents/${req.user.id}/${uuidv4()}/${req.file.originalname}`;
        fileUrl = await s3Service.uploadFile(req.file.path, fileKey);
      } else {
        return res.status(400).json({ error: 'Template ID or file is required' });
      }

      const document = await Document.create({
        templateId: templateId || null,
        senderId: req.user.id,
        title,
        originalFileUrl: fileUrl,
        message,
        expirationDate
      });

      res.status(201).json({ document });
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (document.status !== 'draft') {
        return res.status(400).json({ error: 'Cannot update document after sending' });
      }

      res.json({ document });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Document.delete(id, req.user.id);
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async sendDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { recipients } = req.body;

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'At least one recipient is required' });
      }

      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (document.status !== 'draft') {
        return res.status(400).json({ error: 'Document already sent' });
      }

      const recipientsWithTokens = recipients.map((recipient, index) => ({
        ...recipient,
        access_token: generateToken(),
        signing_order: recipient.signing_order || index + 1
      }));

      await Document.addRecipients(id, recipientsWithTokens);
      await Document.updateStatus(id, 'sent');

      const sender = req.user;
      for (const recipient of recipientsWithTokens) {
        try {
          await emailService.sendSigningRequest(recipient, document, sender, recipient.access_token);
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
        }
      }

      res.json({
        message: 'Document sent successfully',
        recipients: recipientsWithTokens.map(r => ({ name: r.name, email: r.email }))
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipients(req, res, next) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const recipients = await Document.getRecipients(id);
      res.json({ recipients });
    } catch (error) {
      next(error);
    }
  }

  async resendToRecipient(req, res, next) {
    try {
      const { id } = req.params;
      const { recipientId } = req.body;

      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const recipients = await Document.getRecipients(id);
      const recipient = recipients.find(r => r.id === recipientId);

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      if (recipient.status === 'completed') {
        return res.status(400).json({ error: 'Recipient has already signed' });
      }

      const sender = req.user;
      await emailService.sendReminderEmail(recipient, document, sender, recipient.access_token);

      res.json({ message: 'Reminder sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  async downloadDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const fileUrl = document.signed_file_url || document.original_file_url;
      const fileKey = s3Service.extractKeyFromUrl(fileUrl);
      const signedUrl = await s3Service.getSignedUrl(fileKey, 3600);

      res.json({ downloadUrl: signedUrl });
    } catch (error) {
      next(error);
    }
  }

  async voidDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.sender_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (document.status === 'completed') {
        return res.status(400).json({ error: 'Cannot void completed document' });
      }

      await Document.updateStatus(id, 'voided');
      res.json({ message: 'Document voided successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
