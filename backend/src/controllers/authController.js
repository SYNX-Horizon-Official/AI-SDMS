const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const HOD = require('../models/HOD');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, ...roleSpecificData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    let user;

    if (role === 'student') {
      user = new Student({
        email,
        password,
        firstName,
        lastName,
        role: 'student',
        ...roleSpecificData,
      });
    } else if (role === 'faculty') {
      user = new Faculty({
        email,
        password,
        firstName,
        lastName,
        role: 'faculty',
        ...roleSpecificData,
      });
    } else if (role === 'hod') {
      user = new HOD({
        email,
        password,
        firstName,
        lastName,
        role: 'hod',
        ...roleSpecificData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    await user.save();

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        changePasswordRequired: user.changePasswordRequired,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    user.changePasswordRequired = false;
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset link

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
      resetToken, // In production, send via email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in forgot password',
      error: error.message,
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.resetPasswordExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired',
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

// Logout
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};
