const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, attachUser } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');

// Public Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Routes
router.get('/me', verifyToken, attachUser, authController.getCurrentUser);
router.post('/change-password', verifyToken, authController.changePassword);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
