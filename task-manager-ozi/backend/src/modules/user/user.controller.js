const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

async function profile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user._id);
    return res.json(new ApiResponse({ data: user }));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    return res.json(new ApiResponse({ data: user, message: 'Profile updated successfully' }));
  } catch (err) {
    return next(err);
  }
}

async function uploadProfilePicture(req, res, next) {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return next(new ApiError(400, 'Image data is required'));
    }
    const user = await userService.uploadProfilePicture(req.user._id, imageData);
    return res.json(new ApiResponse({ data: user, message: 'Profile picture uploaded successfully' }));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteProfile(req.user._id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, 'Current and new password required'));
    }
    await userService.changePassword(req.user._id, currentPassword, newPassword);
    return res.json(new ApiResponse({ message: 'Password changed successfully' }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { profile, update, remove, uploadProfilePicture, changePassword };
