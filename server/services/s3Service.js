const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Local storage directory
const LOCAL_STORAGE_DIR = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

class S3Service {
  async uploadFile(filePath, key, contentType = 'application/pdf') {
    try {
      // Use local storage in development
      if (process.env.NODE_ENV !== 'production' || !process.env.AWS_S3_BUCKET) {
        const targetPath = path.join(LOCAL_STORAGE_DIR, key);
        const targetDir = path.dirname(targetPath);

        // Create directory structure if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy file to local storage
        fs.copyFileSync(filePath, targetPath);
        fs.unlinkSync(filePath);

        // Return local URL
        return `/uploads/${key}`;
      }

      // AWS S3 upload for production
      const { s3 } = require('../config/aws');
      const fileContent = fs.readFileSync(filePath);

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'private'
      };

      const result = await s3.upload(params).promise();
      fs.unlinkSync(filePath);
      return result.Location;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadBuffer(buffer, key, contentType = 'application/pdf') {
    try {
      // Use local storage in development
      if (process.env.NODE_ENV !== 'production' || !process.env.AWS_S3_BUCKET) {
        const targetPath = path.join(LOCAL_STORAGE_DIR, key);
        const targetDir = path.dirname(targetPath);

        // Create directory structure if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Write buffer to local storage
        fs.writeFileSync(targetPath, buffer);

        // Return local URL
        return `/uploads/${key}`;
      }

      // AWS S3 upload for production
      const { s3 } = require('../config/aws');
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'private'
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Buffer upload error:', error);
      throw new Error('Failed to upload buffer');
    }
  }

  async getFile(key) {
    try {
      // Use local storage in development
      if (process.env.NODE_ENV !== 'production' || !process.env.AWS_S3_BUCKET) {
        const filePath = path.join(LOCAL_STORAGE_DIR, key);
        return fs.readFileSync(filePath);
      }

      // AWS S3 download for production
      const { s3 } = require('../config/aws');
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      const result = await s3.getObject(params).promise();
      return result.Body;
    } catch (error) {
      console.error('File download error:', error);
      throw new Error('Failed to download file');
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    try {
      // Use local URL in development
      if (process.env.NODE_ENV !== 'production' || !process.env.AWS_S3_BUCKET) {
        return `http://localhost:${process.env.PORT || 8080}/uploads/${key}`;
      }

      // AWS S3 signed URL for production
      const { s3 } = require('../config/aws');
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: expiresIn
      };

      return await s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async deleteFile(key) {
    try {
      // Use local storage in development
      if (process.env.NODE_ENV !== 'production' || !process.env.AWS_S3_BUCKET) {
        const filePath = path.join(LOCAL_STORAGE_DIR, key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return;
      }

      // AWS S3 delete for production
      const { s3 } = require('../config/aws');
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('File delete error:', error);
      throw new Error('Failed to delete file');
    }
  }

  extractKeyFromUrl(url) {
    // Handle local URLs
    if (url.startsWith('/uploads/')) {
      return url.replace('/uploads/', '');
    }
    // Handle S3 URLs
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }
}

module.exports = new S3Service();
