const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaimById,
  getMyClaims,
  getIncomingClaimRequests,
  getClaimsForItem,
  askFollowUp,
  replyFollowUp,
  acceptClaim,
  rejectClaim,
  resubmitClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

// All claim endpoints require authentication
router.post('/', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/requests', protect, getIncomingClaimRequests);
router.get('/item/:itemId', protect, getClaimsForItem);
router.get('/:claimId', protect, getClaimById);
router.post('/:claimId/follow-up', protect, askFollowUp);
router.post('/:claimId/reply', protect, replyFollowUp);
router.post('/:claimId/accept', protect, acceptClaim);
router.post('/:claimId/reject', protect, rejectClaim);
router.post('/:claimId/resubmit', protect, resubmitClaim);

module.exports = router;
