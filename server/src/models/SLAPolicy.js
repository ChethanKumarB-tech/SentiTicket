const mongoose = require('mongoose');

const priorityRuleSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true
    },
    responseTargetMinutes: {
      type: Number,
      required: [true, 'Response target in minutes is required'],
      min: [5, 'Response target must be at least 5 minutes']
    },
    resolutionTargetMinutes: {
      type: Number,
      required: [true, 'Resolution target in minutes is required'],
      min: [15, 'Resolution target must be at least 15 minutes']
    },
    warningThresholdPercentage: {
      type: Number,
      default: 50,
      min: 10,
      max: 90
    },
    criticalThresholdPercentage: {
      type: Number,
      default: 80,
      min: 20,
      max: 95
    }
  },
  { _id: false }
);

const escalationRuleSchema = new mongoose.Schema(
  {
    thresholdPercentage: {
      type: Number,
      required: true,
      min: 50,
      max: 150
    },
    escalateToTier: {
      type: Number,
      required: true,
      default: 1
    },
    notifyRoles: {
      type: [String],
      enum: ['AGENT', 'MANAGER', 'ADMIN'],
      default: ['MANAGER']
    }
  },
  { _id: false }
);

const slaPolicySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'SLA Policy name is required'],
      trim: true,
      maxlength: [100, 'Policy name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    priorityRules: {
      type: [priorityRuleSchema],
      required: true,
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'SLA policy must define at least one priority rule'
      }
    },
    businessHoursOnly: {
      type: Boolean,
      default: true
    },
    escalationRules: {
      type: [escalationRuleSchema],
      default: []
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

slaPolicySchema.index({ organizationId: 1, isDefault: 1 });
slaPolicySchema.index({ organizationId: 1, status: 1 });

const SLAPolicy = mongoose.model('SLAPolicy', slaPolicySchema);

module.exports = SLAPolicy;
