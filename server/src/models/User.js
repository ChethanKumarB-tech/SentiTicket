const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['CUSTOMER', 'AGENT', 'MANAGER', 'ADMIN'],
        message: 'Role must be CUSTOMER, AGENT, MANAGER, or ADMIN'
      },
      default: 'CUSTOMER',
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'SUSPENDED'],
        message: 'Status must be PENDING_VERIFICATION, ACTIVE, LOCKED, or SUSPENDED'
      },
      default: 'PENDING_VERIFICATION',
      index: true
    },
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaSecret: {
      type: String,
      select: false,
      default: null
    },
    mfaBackupCodes: {
      type: [String],
      select: false,
      default: []
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: {
      type: Date,
      default: null
    },
    tokenVersion: {
      type: Number,
      default: 1
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ organizationId: 1, email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ lockoutUntil: 1 });

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.set('toJSON', {\n  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.mfaSecret;
    delete ret.mfaBackupCodes;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
