const express = require('express');
const { uploadWithJson } = require('../utils/Multer');
const {
  registerUser,
  loginUser,
  updateProfile,
  firebaseGoogleAuth,
  firebaseFacebookAuth,
  forgotPassword,
  getResetPasswordPage,
  resetPassword,
  changePassword,
  verifyEmail,
  savePushToken,
  removePushToken,
  getPushToken,
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  clearNotifications
} = require('../controllers/User');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// ================= AUTH =================
router.post('/register', registerUser);
router.post('/login', loginUser);

// ================= PROFILE =================
router.get('/me', isAuthenticatedUser, async (req, res) => {
  const user = await require('../models/User').findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// UPDATE PROFILE
router.put('/me/update', isAuthenticatedUser, uploadWithJson, updateProfile);

// ================= FIREBASE AUTH =================
router.post('/firebase/auth/google', firebaseGoogleAuth);
router.post('/firebase/auth/facebook', firebaseFacebookAuth);

// ================= PASSWORD RESET =================
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', getResetPasswordPage);
router.put('/reset-password/:token', resetPassword);

// ================= CHANGE PASSWORD =================
router.put('/change-password', isAuthenticatedUser, changePassword);

// ================= EMAIL VERIFICATION =================
// NOTE: The verification URL must include "/users" because the router is mounted at "/api/v1/users"
router.get('/verify-email/:token', verifyEmail);

// ================= PUSH NOTIFICATIONS =================
router.post('/push-token', isAuthenticatedUser, savePushToken);
router.delete('/push-token', isAuthenticatedUser, removePushToken);
router.get('/push-token', isAuthenticatedUser, getPushToken);
router.get('/notifications', isAuthenticatedUser, getUserNotifications);
router.put('/notifications/read', isAuthenticatedUser, markNotificationsAsRead);
router.delete('/notifications', isAuthenticatedUser, clearNotifications);
router.delete('/notifications/:id', isAuthenticatedUser, deleteNotification);


module.exports = router;
