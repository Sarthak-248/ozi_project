const cloudinary = require('cloudinary').v2;
const env = require('./src/config/env');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

console.log('Cloudinary Config:');
console.log('Cloud Name:', env.cloudinary.cloudName);
console.log('API Key:', env.cloudinary.apiKey);
console.log('API Secret:', env.cloudinary.apiSecret);

// Test with a sample image (create a simple base64 test image)
const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testUpload() {
  try {
    console.log('\nAttempting to upload test image to Cloudinary...');
    const result = await cloudinary.uploader.upload(sampleBase64, {
      folder: 'task-manager/profiles',
      resource_type: 'auto',
      public_id: 'test-upload'
    });
    console.log('✓ Upload successful!');
    console.log('Image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('✗ Upload failed!');
    console.error('Error:', error.message);
  }
}

testUpload();
