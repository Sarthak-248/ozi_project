import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile(){
  const navigate = useNavigate();
  // Get the setUser from AuthContext to update global user state
  const { user: authUser, setUser: setAuthUser } = useAuth();
  
  // All state and refs must be declared before useForm/useEffect
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com', phone: '', location: '', bio: '', createdAt: new Date() });
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef();
  
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreviewImage(reader.result);
        // Upload to Cloudinary immediately after selection
        try {
          setUploadingImage(true);
          const response = await api.post('/users/me/profile-picture', {
            imageData: reader.result
          });
          const updatedUser = { ...user, profilePicture: response.data.data.profilePicture };
          setUser(updatedUser);
          // Also update the global auth context so the top-right avatar updates
          setAuthUser(updatedUser);
          setMessage('Profile picture uploaded successfully');
        } catch (error) {
          setMessage(error.response?.data?.message || 'Failed to upload image');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setAuthUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const [message, setMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // react-hook-form for profile edit
  const { register, handleSubmit, reset: resetProfileForm } = useForm({
    defaultValues: { name: '', email: '', phone: '', location: '', bio: '' }
  });
  // react-hook-form for password change
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, watch } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' }
  });

  // When entering edit mode, populate form with user data
  useEffect(() => {
    if (editing && user) {
      resetProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [editing, user, resetProfileForm]);

  // Load user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data.data) {
          setUser(response.data.data);
          setAuthUser(response.data.data);
          if (response.data.data.profilePicture) {
            setPreviewImage(response.data.data.profilePicture);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    fetchProfile();
  }, [setAuthUser]);

  async function handleSave(data) {
    try {
      setMessage('');
      const response = await api.patch('/users/me', data);
      if (response.data.data) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        setAuthUser(updatedUser);
        setMessage('Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async function handlePasswordChange(data) {
    setPasswordMessage('');
    if (data.newPassword !== data.confirmNewPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }
    try {
      const response = await api.post('/users/me/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordMessage('Password changed successfully');
      resetPasswordForm();
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password change failed:', error);
      setPasswordMessage(error.response?.data?.message || 'Failed to change password');
    }
  }
    // Animation variants for framer-motion containers
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.1, duration: 0.5 },
      },
    };

    // (Removed duplicate declarations of editing, setEditing, user, etc. Only declare once at the top.)
// ...existing code...

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8"
      >
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-8"
        >
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            My Profile
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 font-semibold transition shadow-lg shadow-red-500/50"
          >
            Logout
          </motion.button>
        </motion.div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-lg backdrop-blur-sm border ${
              message.includes('success') 
                ? 'bg-green-500/20 border-green-500/50 text-green-300' 
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}
          >
            {message}
          </motion.div>
        )}

        {!editing && !showPasswordForm ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Profile Picture Section */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-center gap-4 border-b border-white/10 pb-6"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                {previewImage ? (
                  <motion.img
                    src={previewImage}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/50 shadow-lg shadow-purple-500/30"
                  />
                ) : (
                  <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-4 border-white/20 flex items-center justify-center text-3xl font-bold text-white"
                  >
                    {user.name[0]?.toUpperCase()}
                  </motion.div>
                )}
              </motion.div>
              {editing && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold transition shadow-lg shadow-blue-500/50"
                  >
                    Change Picture
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400">Max 5MB • JPG, PNG, GIF</p>
                </>
              )}
            </motion.div>

            {/* User Info Section */}
            <motion.div 
              variants={itemVariants}
              className="border-b border-white/10 pb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Full Name</p>
              <p className="text-2xl font-semibold text-white">{user.name}</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="border-b border-white/10 pb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Email Address</p>
              <p className="text-2xl font-semibold text-white">{user.email}</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="border-b border-white/10 pb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Phone</p>
              <p className="text-lg text-gray-300">{user.phone || '-'}</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="border-b border-white/10 pb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Location</p>
              <p className="text-lg text-gray-300">{user.location || '-'}</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="border-b border-white/10 pb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Bio</p>
              <p className="text-lg text-gray-300">{user.bio || '-'}</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="border-b border-white/10 pb-6"
            >
              <p className="text-sm text-gray-400 mb-2">Member Since</p>
              <p className="text-lg text-gray-300">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </motion.div>

            <motion.div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition shadow-lg shadow-purple-500/50"
              >
                Edit Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPasswordForm((v) => !v)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 font-semibold transition shadow-lg shadow-pink-500/50"
              >
                Change Password
              </motion.button>
            </motion.div>
          </motion.div>
        ) : null}
        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Change Your Password
              </h2>
              {passwordMessage && (
                <div 
                  className={`mb-6 p-4 rounded-lg backdrop-blur-sm border ${
                    passwordMessage.includes('success') 
                      ? 'bg-green-500/20 border-green-500/50 text-green-300' 
                      : 'bg-red-500/20 border-red-500/50 text-red-300'
                  }`}
                >
                  {passwordMessage}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    {...registerPassword('confirmNewPassword', { required: 'Please confirm your password' })}
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold transition shadow-lg shadow-emerald-500/50"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      resetPasswordForm();
                      setPasswordMessage('');
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-gray-300 rounded-lg hover:bg-white/20 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
        {editing && (
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          {/* Profile Picture Edit Section */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-white/10"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {previewImage ? (
                <motion.img
                  src={previewImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/50 shadow-lg shadow-blue-500/30"
                />
              ) : (
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-4 border-white/20 flex items-center justify-center text-3xl font-bold text-white"
                >
                  {user.name[0]?.toUpperCase() || 'U'}
                </motion.div>
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold transition shadow-lg shadow-blue-500/50"
            >
              Choose Image
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              {...register('name', { required: true })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
              placeholder="Full Name"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              {...register('email', { required: true })}
              type="email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
              placeholder="Email Address"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input
              {...register('phone')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
              placeholder="Phone number"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              {...register('location')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
              placeholder="Location"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              {...register('bio')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
              placeholder="Short bio/about you"
              rows={3}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 font-semibold transition shadow-lg shadow-emerald-500/50"
            >
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setEditing(false);
                resetProfileForm({
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  location: user.location,
                  bio: user.bio
                });
                setPreviewImage(user.profilePicture || null);
              }}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-gray-300 rounded-lg hover:bg-white/20 font-semibold transition"
            >
              Cancel
            </motion.button>
          </motion.div>
        </form>
        )}
        
      </motion.div>
    </div>
  )

}