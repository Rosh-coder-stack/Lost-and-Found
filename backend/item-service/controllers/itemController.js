const mongoose = require('mongoose');
const Item = require('../models/Item');

// Default category images for placeholder fallback
const CATEGORY_DEFAULT_IMAGES = {
  'Electronics': 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
  'Wallets & Bags': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
  'Keys': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  'Jewelry & Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  'Documents & IDs': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  'Clothing & Accessories': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  'Pets': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
  'Other': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
};

/**
 * @desc    Create a new Lost or Found Item Report
 * @route   POST /api/v1/items/lost, POST /api/v1/items/found, or POST /api/v1/items
 * @access  Private (Authenticated User only)
 */
const createLostItem = async (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      locationFound,
      foundLocation,
      dateLost,
      dateFound,
      date,
      imageUrl,
      distinguishingDetails,
      safekeepingDetails,
      safekeeping,
      contactPreference,
      contactDetails,
    } = req.body;

    const itemType =
      (type && type.toLowerCase() === 'found') ||
      req.path === '/found' ||
      (req.originalUrl && req.originalUrl.includes('/found'))
        ? 'found'
        : 'lost';

    const finalLocation = (location || locationFound || foundLocation || '').trim();
    const rawDate = dateLost || dateFound || date || new Date();
    const finalDetails = (distinguishingDetails || safekeepingDetails || safekeeping || '').trim();

    // Use user-provided image, or default category placeholder
    const finalImageUrl = imageUrl && imageUrl.trim()
      ? imageUrl.trim()
      : CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES['Other'];

    // Create new item record in MongoDB strictly tied to authenticated user ID
    const newItem = await Item.create({
      type: itemType,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: finalLocation,
      dateLost: new Date(rawDate),
      imageUrl: finalImageUrl,
      distinguishingDetails: finalDetails,
      contactPreference: contactPreference || 'email',
      contactDetails: contactDetails ? contactDetails.trim() : '',
      status: 'searching',
      statusType: 'searching',
      userId: req.user.id || req.user._id,
      reporterName: req.user.name || '',
      reporterEmail: req.user.email || '',
    });

    return res.status(201).json({
      success: true,
      message: `${itemType === 'found' ? 'Found' : 'Lost'} item report created successfully`,
      data: newItem,
    });
  } catch (error) {
    console.error('[Item Service] Error creating item report:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error creating item report',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new Found Item Report (Convenience handler)
 * @route   POST /api/v1/items/found
 * @access  Private (Authenticated User only)
 */
const createFoundItem = async (req, res) => {
  req.body.type = 'found';
  return createLostItem(req, res);
};

/**
 * @desc    Get all lost item reports for the currently authenticated user
 * @route   GET /api/v1/items/my-reports
 * @access  Private (Authenticated User only)
 */
const getUserReports = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const userItems = await Item.find({ userId: currentUserId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: userItems.length,
      data: userItems,
    });
  } catch (error) {
    console.error('[Item Service] Error fetching user reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching user reports',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all active lost and found items (Global / Public Browse)
 * @route   GET /api/v1/items
 * @access  Public / Authenticated
 */
const getAllItems = async (req, res) => {
  try {
    const { category, status, type, search } = req.query;

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (status && status !== 'All') {
      filter.status = status.toLowerCase();
    }
    if (type && type !== 'All') {
      filter.type = type.toLowerCase();
    }
    if (search && search.trim()) {//important
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
      ];
    }

    const items = await Item.find(filter).sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('[Item Service] Error fetching all items:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching items',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/v1/items/:id
 * @access  Public
 */
const getItemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item report ID format',
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('[Item Service] Error fetching item by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching item',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing item report
 * @route   PUT /api/v1/items/:id
 * @access  Private (Authenticated Owner only)
 */
const updateItemReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item report ID format',
      });
    }

    // 1. Find the target item report
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item report not found',
      });
    }

    // 2. Strict Ownership Check: enforce that only the report owner can modify
    const currentUserId = (req.user.id || req.user._id).toString();
    const itemOwnerId = item.userId.toString();

    if (itemOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this report. You can only edit reports you created.',
      });
    }

    // 3. Extract and update allowed fields
    const {
      type,
      title,
      category,
      description,
      location,
      dateLost,
      imageUrl,
      distinguishingDetails,
      contactPreference,
      contactDetails,
      status,
    } = req.body;

    if (type !== undefined && ['lost', 'found'].includes(type.toLowerCase())) {
      item.type = type.toLowerCase();
    }
    if (title !== undefined) item.title = title.trim();
    if (category !== undefined) item.category = category.trim();
    if (description !== undefined) item.description = description.trim();
    if (location !== undefined) item.location = location.trim();
    if (dateLost !== undefined) item.dateLost = new Date(dateLost);
    if (imageUrl !== undefined) {
      item.imageUrl = imageUrl && imageUrl.trim()
        ? imageUrl.trim()
        : CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];
    }
    if (distinguishingDetails !== undefined) {
      item.distinguishingDetails = distinguishingDetails.trim();
    }
    if (contactPreference !== undefined) {
      item.contactPreference = contactPreference;
    }
    if (contactDetails !== undefined) {
      item.contactDetails = contactDetails.trim();
    }
    if (status !== undefined) {
      const normalizedStatus = status.toLowerCase();
      item.status = normalizedStatus;
      if (normalizedStatus === 'matched') {
        item.statusType = 'match';
      } else if (['claimed', 'returned', 'resolved'].includes(normalizedStatus)) {
        item.statusType = 'resolved';
      } else {
        item.statusType = 'searching';
      }
    }

    // 4. Save updated document
    const updatedItem = await item.save();

    return res.status(200).json({
      success: true,
      message: `${updatedItem.type === 'found' ? 'Found' : 'Lost'} item report updated successfully`,
      data: updatedItem,
    });
  } catch (error) {
    console.error('[Item Service] Error updating item report:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating report',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete an existing item report
 * @route   DELETE /api/v1/items/:id
 * @access  Private (Authenticated Owner only)
 */
const deleteItemReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item report ID format',
      });
    }

    // 1. Find the target item report
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found',
      });
    }

    // 2. Strict Ownership Check: enforce that only the report owner can delete
    const currentUserId = (req.user.id || req.user._id).toString();
    const itemOwnerId = item.userId.toString();

    if (itemOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this report. You can only delete reports you created.',
      });
    }

    // 3. Delete the item from MongoDB
    await Item.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Item report deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('[Item Service] Error deleting item report:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error deleting report',
      error: error.message,
    });
  }
};

module.exports = {
  createLostItem,
  createFoundItem,
  getUserReports,
  getAllItems,
  getItemById,
  updateItemReport,
  deleteItemReport,
};

