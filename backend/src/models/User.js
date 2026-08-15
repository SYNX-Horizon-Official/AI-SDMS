const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
    phone: {
      type: String,
      match: [/^[0-9]{10,15}$/, 'Invalid phone number'],
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'hod', 'admin'],
      required: [true, 'Role is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    profilePicture: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    changePasswordRequired: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'userType',
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// Get full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
