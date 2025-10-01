const Document = require('../models/Document');
const Signature = require('../models/Signature');
const SignaturePlacement = require('../models/SignaturePlacement');
const s3Service = require('../services/s3Service');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const { getClientIp, isExpired } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

class SignatureController {
  async getDocumentForSigning(req, res, next) {
    try {
      const { token } = req.params;

      const recipientData = await Document.getRecipientByToken(token);
      if (!recipientData) {
        return res.status(404).json({ error: 'Document not found or invalid link' });
      }

      if (recipientData.status === 'completed') {
        return res.status(400).json({ error: 'Document already signed' });
      }

      if (recipientData.expiration_date && isExpired(recipientData.expiration_date)) {
        return res.status(400).json({ error: 'Document has expired' });
      }

      if (recipientData.status === 'voided') {
        return res.status(400).json({ error: 'Document has been voided' });
      }

      let placements = [];
      if (recipientData.template_id) {
        placements = await SignaturePlacement.findByTemplateId(recipientData.template_id);
      }

      const fileKey = s3Service.extractKeyFromUrl(recipientData.original_file_url);
      const signedUrl = await s3Service.getSignedUrl(fileKey, 3600);

      const existingSignatures = await Signature.findByRecipientId(recipientData.id);

      if (recipientData.status === 'pending') {
        await Document.updateRecipientStatus(recipientData.id, 'viewed', getClientIp(req));
      }

      res.json({
        document: {
          id: recipientData.document_id,
          title: recipientData.title,
          message: recipientData.message,
          fileUrl: signedUrl,
          status: recipientData.status
        },
        recipient: {
          id: recipientData.id,
          name: recipientData.name,
          email: recipientData.email,
          role: recipientData.role
        },
        placements,
        existingSignatures
      });
    } catch (error) {
      next(error);
    }
  }

  async submitSignature(req, res, next) {
    try {
      const { token } = req.params;
      const { signatures } = req.body;

      if (!Array.isArray(signatures) || signatures.length === 0) {
        return res.status(400).json({ error: 'Signatures are required' });
      }

      const recipientData = await Document.getRecipientByToken(token);
      if (!recipientData) {
        return res.status(404).json({ error: 'Document not found or invalid link' });
      }

      if (recipientData.status === 'completed') {
        return res.status(400).json({ error: 'Document already signed' });
      }

      if (recipientData.expiration_date && isExpired(recipientData.expiration_date)) {
        return res.status(400).json({ error: 'Document has expired' });
      }

      if (recipientData.status === 'voided') {
        return res.status(400).json({ error: 'Document has been voided' });
      }

      let placements = [];
      if (recipientData.template_id) {
        placements = await SignaturePlacement.findByTemplateId(recipientData.template_id);
      }

      const requiredPlacements = placements.filter(p => p.is_required);
      const providedPlacementIds = signatures.map(s => s.placementId);

      for (const required of requiredPlacements) {
        if (!providedPlacementIds.includes(required.id)) {
          return res.status(400).json({
            error: 'All required fields must be filled',
            missingField: required.field_label || required.field_type
          });
        }
      }

      const signaturesToCreate = signatures.map(sig => ({
        documentId: recipientData.document_id,
        recipientId: recipientData.id,
        placementId: sig.placementId,
        signatureData: sig.signatureData || null,
        value: sig.value || null
      }));

      await Signature.createMultiple(signaturesToCreate);
      await Document.updateRecipientStatus(recipientData.id, 'completed', getClientIp(req));

      const allRecipients = await Document.getRecipients(recipientData.document_id);
      const allSigned = allRecipients.every(r => r.status === 'completed');

      if (allSigned) {
        const fileKey = s3Service.extractKeyFromUrl(recipientData.original_file_url);
        const originalPdfBuffer = await s3Service.getFile(fileKey);

        const allSignatures = await Signature.findByDocumentId(recipientData.document_id);

        const modifiedPdfBuffer = await pdfService.addSignaturesToPdf(originalPdfBuffer, allSignatures);

        const sender = await User.findById(recipientData.sender_id);
        const auditData = {
          title: recipientData.title,
          completed_at: new Date(),
          signers: allRecipients.map(r => ({
            name: r.name,
            email: r.email,
            signed_at: r.signed_at,
            ip_address: r.ip_address
          }))
        };

        const finalPdfBuffer = await pdfService.addAuditTrail(modifiedPdfBuffer, auditData);

        const signedFileKey = `signed/${recipientData.document_id}/${uuidv4()}/signed-document.pdf`;
        const signedFileUrl = await s3Service.uploadBuffer(finalPdfBuffer, signedFileKey);

        await Document.updateSignedFileUrl(recipientData.document_id, signedFileUrl);
        await Document.updateStatus(recipientData.document_id, 'completed');

        try {
          await emailService.sendCompletionNotification(
            { ...recipientData, title: recipientData.title },
            allRecipients,
            sender
          );
        } catch (error) {
          console.error('Error sending completion notifications:', error);
        }
      }

      res.json({
        message: 'Signature submitted successfully',
        status: allSigned ? 'completed' : 'partially_signed'
      });
    } catch (error) {
      next(error);
    }
  }

  async getSigningStatus(req, res, next) {
    try {
      const { token } = req.params;

      const recipientData = await Document.getRecipientByToken(token);
      if (!recipientData) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({
        status: recipientData.status,
        documentStatus: recipientData.status
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SignatureController();
