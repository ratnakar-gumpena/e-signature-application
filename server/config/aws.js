const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: process.env.AWS_S3_BUCKET }
});

module.exports = {
  s3,
  AWS
};
