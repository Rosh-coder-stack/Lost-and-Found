const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['claimant', 'reporter'],
      required: true,
    },
    senderName: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const claimSchema = new mongoose.Schema(
  {
    // Associated Item ID from item-service
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Item ID is required'],
      index: true,
    },

    // Snapshot of Item Metadata for quick rendering
    itemTitle: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
    },
    itemType: {
      type: String,
      enum: ['lost', 'found'],
      default: 'found',
    },
    itemImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    itemLocation: {
      type: String,
      trim: true,
      default: '',
    },
    itemCategory: {
      type: String,
      trim: true,
      default: 'Other',
    },

    // Claimant user identity (derived from JWT)
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Claimant ID is required'],
      index: true,
    },
    claimantName: {
      type: String,
      trim: true,
      default: '',
    },
    claimantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    claimantPhone: {
      type: String,
      trim: true,
      default: '',
    },

    // Item Reporter / Owner identity (from item-service)
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Reporter ID is required'],
      index: true,
    },
    reporterName: {
      type: String,
      trim: true,
      default: '',
    },
    reporterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    reporterContactDetails: {
      type: String,
      trim: true,
      default: '',
    },

    // Claim Lifecycle Status
    status: {
      type: String,
      enum: [
        'PENDING',
        'FOLLOW_UP_REQUIRED',
        'ACCEPTED',
        'REJECTED',
        'FINAL_REJECTED',
      ],
      default: 'PENDING',
      index: true,
    },

    // Current claim attempt number (Max 2 attempts per user per item)
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
    },

    // Initial / Latest proof submitted by claimant
    proofMessage: {
      type: String,
      required: [true, 'Proof of ownership is required'],
      trim: true,
      maxlength: [2000, 'Proof cannot exceed 2000 characters'],
    },

    // Conversation thread for follow-up questions and replies
    messages: [messageSchema],

    // Optional note or reason provided upon decision
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    decisionNote: {
      type: String,
      trim: true,
      default: '',
    },
    decisionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted relative time
claimSchema.virtual('timeAgo').get(function () {
  const diffMs = Date.now() - new Date(this.createdAt).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Ensure virtuals are serialized
claimSchema.set('toJSON', { virtuals: true });
claimSchema.set('toObject', { virtuals: true });

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
