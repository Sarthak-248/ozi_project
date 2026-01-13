const User = require('./user.model');
const ApiError = require('../../utils/ApiError');
const Task = require('../task/task.model');
const cloudinary = require('cloudinary').v2;
const env = require('../../config/env');

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

async function getProfile(userId) {
  const user = await User.findById(userId).select('-password -refreshTokens');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function updateProfile(userId, payload) {
  const updateData = { name: payload.name };
  if (payload.email) updateData.email = payload.email;
  if (payload.phone) updateData.phone = payload.phone;
  if (payload.bio) updateData.bio = payload.bio;
  if (payload.location) updateData.location = payload.location;
  if (payload.profilePicture) {
    if (!payload.profilePicture.startsWith('data:image')) {
      throw new ApiError(400, 'Invalid image format. Must be a valid base64 image');
    }
    updateData.profilePicture = payload.profilePicture;
  }
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -refreshTokens');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function uploadProfilePicture(userId, imageData) {
  if (!imageData.startsWith('data:image')) {
    throw new ApiError(400, 'Invalid image format. Must be a valid base64 image');
  }
  
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageData, {
      folder: 'task-manager/profiles',
      resource_type: 'auto',
      overwrite: true,
      public_id: `user-${userId}`
    });
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password -refreshTokens');
    
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  } catch (error) {
    throw new ApiError(500, 'Failed to upload image to Cloudinary: ' + error.message);
  }
}

async function deleteProfile(userId) {
  await Task.deleteMany({ userId });
  await User.findByIdAndDelete(userId);
}

const bcrypt = require('bcryptjs');

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new ApiError(400, 'Current password is incorrect');
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
}

module.exports = { getProfile, updateProfile, deleteProfile, uploadProfilePicture, changePassword };
