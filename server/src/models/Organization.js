const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    domain: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },
    settings: {
      allowPublicRegistration: {
        type: Boolean,
        default: true
      },
      defaultSlaPolicyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SLAPolicy',
        default: null
      },
      businessHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
        timeZone: { type: String, default: 'UTC' },
        workDays: {
          type: [Number],
          default: [1, 2, 3, 4, 5]
        }
      }
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
        message: 'Status must be ACTIVE, SUSPENDED, or DEACTIVATED'
      },
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ domain: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
