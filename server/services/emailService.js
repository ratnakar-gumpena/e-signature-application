const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendSigningRequest(recipient, document, sender, accessToken) {
    const signingUrl = `${process.env.CLIENT_URL}/sign/${accessToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: `Signature Request: ${document.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Signature Request</h1>
            </div>
            <div class="content">
              <p>Hello ${recipient.name},</p>
              <p>${sender.name} (${sender.email}) has sent you a document that requires your signature.</p>
              <p><strong>Document:</strong> ${document.title}</p>
              ${document.message ? `<p><strong>Message:</strong> ${document.message}</p>` : ''}
              ${document.expiration_date ? `<p><strong>Expires on:</strong> ${new Date(document.expiration_date).toLocaleDateString()}</p>` : ''}
              <p>Click the button below to review and sign the document:</p>
              <a href="${signingUrl}" class="button">Review and Sign</a>
              <p>Or copy this link into your browser: <br>${signingUrl}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} E-Signature App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendCompletionNotification(document, recipients, sender) {
    const emailPromises = [];

    emailPromises.push(
      this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: sender.email,
        subject: `Document Signed: ${document.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Document Completed</h1>
              </div>
              <div class="content">
                <p>Hello ${sender.name},</p>
                <p>Good news! Your document "<strong>${document.title}</strong>" has been signed by all recipients.</p>
                <p><strong>Signed by:</strong></p>
                <ul>
                  ${recipients.map(r => `<li>${r.name} (${r.email}) - ${new Date(r.signed_at).toLocaleString()}</li>`).join('')}
                </ul>
                <p>You can download the signed document from your dashboard.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} E-Signature App. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    );

    for (const recipient of recipients) {
      emailPromises.push(
        this.transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: recipient.email,
          subject: `Document Completed: ${document.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Document Completed</h1>
                </div>
                <div class="content">
                  <p>Hello ${recipient.name},</p>
                  <p>The document "<strong>${document.title}</strong>" has been signed by all parties.</p>
                  <p>Thank you for your participation.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} E-Signature App. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      );
    }

    try {
      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error sending completion notifications:', error);
    }
  }

  async sendReminderEmail(recipient, document, sender, accessToken) {
    const signingUrl = `${process.env.CLIENT_URL}/sign/${accessToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: `Reminder: Signature Required - ${document.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #F59E0B; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Signature Reminder</h1>
            </div>
            <div class="content">
              <p>Hello ${recipient.name},</p>
              <p>This is a reminder that you have a pending signature request from ${sender.name}.</p>
              <p><strong>Document:</strong> ${document.title}</p>
              ${document.expiration_date ? `<p><strong>Expires on:</strong> ${new Date(document.expiration_date).toLocaleDateString()}</p>` : ''}
              <p>Please sign the document at your earliest convenience:</p>
              <a href="${signingUrl}" class="button">Review and Sign</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} E-Signature App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw new Error('Failed to send reminder');
    }
  }
}

module.exports = new EmailService();
