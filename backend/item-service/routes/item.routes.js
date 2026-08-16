const express = require('express');
const router = express.Router();
const {
  createLostItem,
  createFoundItem,
  getUserReports,
  getAllItems,
  getItemById,
  updateItemReport,
  deleteItemReport,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { validateLostItem, validateUpdateItem } = require('../middleware/validateItem');

// Protected Routes (Authentication Required)
router.post('/lost', protect, validateLostItem, createLostItem);
router.post('/found', protect, validateLostItem, createFoundItem);
router.post('/', protect, validateLostItem, createLostItem);
router.get('/my-reports', protect, getUserReports);
router.put('/:id', protect, validateUpdateItem, updateItemReport);
router.delete('/:id', protect, deleteItemReport);

// Public / Read Routes
router.get('/', getAllItems);
router.get('/:id', getItemById);

module.exports = router;

