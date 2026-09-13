const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    // Type of listing: 'lost' (item reported lost) or 'found' (item discovered)
    type: {
      type: String,
      enum: ['lost', 'found'],
      default: 'lost',
      required: true,
    },

    // Title or item name (e.g., 'iPhone 15 Pro', 'Black Leather Wallet')
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    // Category
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Wallets & Bags',
        'Keys',
        'Jewelry & Watches',
        'Documents & IDs',
        'Clothing & Accessories',
        'Pets',
        'Other',
      ],
      default: 'Electronics',
    },

    // Detailed description of the item and circumstances
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Last seen location or discovery spot
    location: {
      type: String,
      required: [true, 'Last seen location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },

    // Date and time the item was lost or found
    dateLost: {
      type: Date,
      required: [true, 'Date and time lost is required'],
      default: Date.now,
    },

    // Photo / Image URL
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },

    // Distinguishing details (colour, brand, serial number, cases, stickers, scratches, etc.)
    distinguishingDetails: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Distinguishing details cannot exceed 1000 characters'],
    },

    // Contact preference
    contactPreference: {
      type: String,
      enum: ['email', 'phone', 'app_chat'],
      default: 'email',
    },

    // Contact details (phone number or alternate contact)
    contactDetails: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Contact details cannot exceed 150 characters'],
    },

    // Current report lifecycle status
    status: {
      type: String,
      enum: ['searching', 'pending_match', 'matched', 'claimed', 'returned', 'resolved'],
      default: 'searching',
    },

    // Status type badge categorization for UI filters
    statusType: {
      type: String,
      enum: ['searching', 'match', 'resolved'],
      default: 'searching',
    },

    // Authenticated reporter ID (strictly derived from JWT token)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required from authenticated session'],
      index: true,
    },

    // Reporter information snapshot
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
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted time ago representation if needed
itemSchema.virtual('timeAgo').get(function () {
  const diffMs = Date.now() - new Date(this.createdAt).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Ensure virtual fields are serialized in JSON output
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
