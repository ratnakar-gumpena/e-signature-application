const { s3 } = require('../config/aws');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class S3Service {
  async uploadFile(filePath, key, contentType = 'application/pdf') {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'private'
    };

    try {
      const result = await s3.upload(params).promise();
      fs.unlinkSync(filePath);
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async uploadBuffer(buffer, key, contentType = 'application/pdf') {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private'
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload buffer to S3');
    }
  }

  async getFile(key) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    try {
      const result = await s3.getObject(params).promise();
      return result.Body;
    } catch (error) {
      console.error('S3 download error:', error);
      throw new Error('Failed to download file from S3');
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn
    };

    try {
      return await s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async deleteFile(key) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  extractKeyFromUrl(url) {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/');
  }
}

module.exports = new S3Service();
