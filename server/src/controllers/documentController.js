const AWS = require('aws-sdk');
const { Document } = require('../models');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `documents/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'private'
    };

    const uploadResult = await s3.upload(params).promise();

    const document = await Document.create({
      fileName: req.file.originalname,
      fileUrl: uploadResult.Location,
      fileType: req.file.mimetype,
      userId: req.user.id // Assuming you have authentication middleware
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 