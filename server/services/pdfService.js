const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const s3Service = require('./s3Service');

class PdfService {
  async addSignaturesToPdf(originalPdfBuffer, signatures) {
    try {
      const pdfDoc = await PDFDocument.load(originalPdfBuffer);
      const pages = pdfDoc.getPages();

      for (const signature of signatures) {
        const page = pages[signature.page_number - 1];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();

        if (signature.field_type === 'signature' || signature.field_type === 'initial') {
          if (signature.signature_data) {
            const imageData = signature.signature_data.split(',')[1];
            const imageBytes = Buffer.from(imageData, 'base64');

            let image;
            if (signature.signature_data.includes('image/png')) {
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              image = await pdfDoc.embedJpg(imageBytes);
            }

            const x = parseFloat(signature.x_position);
            const y = pageHeight - parseFloat(signature.y_position) - parseFloat(signature.height);
            const width = parseFloat(signature.width);
            const height = parseFloat(signature.height);

            page.drawImage(image, {
              x: x,
              y: y,
              width: width,
              height: height
            });
          }
        } else if (signature.field_type === 'text' || signature.field_type === 'date') {
          if (signature.value) {
            const x = parseFloat(signature.x_position);
            const y = pageHeight - parseFloat(signature.y_position) - parseFloat(signature.height);
            const fontSize = Math.min(parseFloat(signature.height) * 0.6, 12);

            page.drawText(signature.value, {
              x: x + 5,
              y: y + parseFloat(signature.height) / 2 - fontSize / 3,
              size: fontSize,
              color: rgb(0, 0, 0)
            });
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      return Buffer.from(modifiedPdfBytes);
    } catch (error) {
      console.error('Error adding signatures to PDF:', error);
      throw new Error('Failed to add signatures to PDF');
    }
  }

  async generateThumbnail(pdfBuffer) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      if (!firstPage) {
        throw new Error('PDF has no pages');
      }

      return null;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  async mergePdfs(pdfBuffers) {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      return Buffer.from(mergedPdfBytes);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDFs');
    }
  }

  async getPdfInfo(pdfBuffer) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      return {
        pageCount: pages.length,
        pages: pages.map((page, index) => ({
          pageNumber: index + 1,
          width: page.getWidth(),
          height: page.getHeight()
        }))
      };
    } catch (error) {
      console.error('Error getting PDF info:', error);
      throw new Error('Failed to get PDF information');
    }
  }

  async addAuditTrail(pdfBuffer, auditData) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const auditPage = pdfDoc.addPage();
      const { width, height } = auditPage.getSize();

      auditPage.drawText('Audit Trail', {
        x: 50,
        y: height - 50,
        size: 20,
        color: rgb(0, 0, 0)
      });

      let yPosition = height - 100;
      const lineHeight = 20;

      auditPage.drawText(`Document: ${auditData.title}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      auditPage.drawText(`Completed: ${new Date(auditData.completed_at).toLocaleString()}`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight * 2;

      auditPage.drawText('Signers:', {
        x: 50,
        y: yPosition,
        size: 14,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      for (const signer of auditData.signers || []) {
        auditPage.drawText(`- ${signer.name} (${signer.email})`, {
          x: 70,
          y: yPosition,
          size: 11,
          color: rgb(0, 0, 0)
        });
        yPosition -= lineHeight;

        auditPage.drawText(`  Signed: ${new Date(signer.signed_at).toLocaleString()}`, {
          x: 90,
          y: yPosition,
          size: 10,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPosition -= lineHeight;

        if (signer.ip_address) {
          auditPage.drawText(`  IP: ${signer.ip_address}`, {
            x: 90,
            y: yPosition,
            size: 10,
            color: rgb(0.3, 0.3, 0.3)
          });
          yPosition -= lineHeight;
        }

        yPosition -= lineHeight / 2;
      }

      const modifiedPdfBytes = await pdfDoc.save();
      return Buffer.from(modifiedPdfBytes);
    } catch (error) {
      console.error('Error adding audit trail:', error);
      throw new Error('Failed to add audit trail');
    }
  }
}

module.exports = new PdfService();
