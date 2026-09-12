const mongoose = require('mongoose');
const Claim = require('../models/Claim');
const { fetchItemById, updateItemStatus } = require('../services/itemServiceClient');
const { publishToExchange } = require('../../shared/utils/rabbitmq');
const rabbitmqConfig = require('../../shared/config/rabbitmq');

/**
 * Format claim object adhering to strict privacy rules:
 * Contact information is ONLY included when claim status is ACCEPTED.
 */
const formatClaimForUser = (claimDoc, currentUserId) => {
  const claim = claimDoc.toObject ? claimDoc.toObject() : { ...claimDoc };
  const userIdStr = currentUserId.toString();
  const isClaimant = claim.claimantId && claim.claimantId.toString() === userIdStr;
  const isReporter = claim.reporterId && claim.reporterId.toString() === userIdStr;

  // Add convenience role flags
  claim.isClaimant = isClaimant;
  claim.isReporter = isReporter;

  // Privacy protection: Hide sensitive direct contact details until ACCEPTED
  if (claim.status !== 'ACCEPTED') {
    delete claim.reporterEmail;
    delete claim.reporterContactDetails;
    delete claim.claimantEmail;
    delete claim.claimantPhone;
  }

  return claim;
};

/**
 * @desc    Submit a new claim request for an item (Attempt 1)
 * @route   POST /api/v1/claims
 * @access  Private (Authenticated User only)
 */


const createClaim = async (req, res) => {
  try {
    const claimantId = req.user.id || req.user._id;
    const claimantName = req.user.name || 'Anonymous User';
    const claimantEmail = req.user.email || '';

    const { itemId, proofMessage, claimantPhone } = req.body;

    // 1. Input Validation
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Item ID format',
      });
    }

    if (!proofMessage || typeof proofMessage !== 'string' || !proofMessage.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Please provide detailed proof of ownership (description, serial number, unique marks, etc.)',
      });
    }

    if (proofMessage.trim().length > 2000) {
      return res.status(422).json({
        success: false,
        message: 'Proof message cannot exceed 2000 characters',
      });
    }

    // 2. Fetch item metadata from Item Service
    const item = await fetchItemById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'The item you are attempting to claim was not found or has been removed.',
      });
    }

    // 3. Validation: Item must not already be claimed/resolved
    if (['claimed', 'resolved', 'returned'].includes((item.status || '').toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: 'This item has already been claimed and resolved. No further claims can be accepted.',
      });
    }

    // 4. Validation: Claimant cannot claim their own reported item
    const reporterId = (item.userId || item.user_id || '').toString();
    if (reporterId && reporterId === claimantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim for an item you reported yourself.',
      });
    }

    // 5. Validation: Check existing claims by this user for this item
    const existingClaim = await Claim.findOne({
      itemId: new mongoose.Types.ObjectId(itemId),
      claimantId: new mongoose.Types.ObjectId(claimantId),
    });

    if (existingClaim) {
      if (existingClaim.status === 'FINAL_REJECTED') {
        return res.status(403).json({
          success: false,
          message: 'Your final ownership claim for this item was previously rejected. You cannot submit another claim.',
        });
      }

      if (existingClaim.status === 'ACCEPTED') {
        return res.status(409).json({
          success: false,
          message: 'You have already successfully claimed this item.',
          data: formatClaimForUser(existingClaim, claimantId),
        });
      }

      if (['PENDING', 'FOLLOW_UP_REQUIRED'].includes(existingClaim.status)) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active claim in progress for this item.',
          data: formatClaimForUser(existingClaim, claimantId),
        });
      }

      if (existingClaim.status === 'REJECTED' && existingClaim.attemptNumber === 1) {
        return res.status(409).json({
          success: false,
          message: 'Your first claim attempt was rejected. Please use the resubmit feature to submit your second and final attempt.',
          claimId: existingClaim._id,
        });
      }
    }

    // 6. Create new Claim record (Attempt 1)
    const initialMessage = {
      senderId: new mongoose.Types.ObjectId(claimantId),
      senderRole: 'claimant',
      senderName: claimantName,
      message: proofMessage.trim(),
      createdAt: new Date(),
    };

    const newClaim = await Claim.create({
      itemId: new mongoose.Types.ObjectId(itemId),
      itemTitle: item.title || 'Reported Item',
      itemType: item.type || 'found',
      itemImageUrl: item.imageUrl || '',
      itemLocation: item.location || '',
      itemCategory: item.category || 'Other',
      claimantId: new mongoose.Types.ObjectId(claimantId),
      claimantName: claimantName,
      claimantEmail: claimantEmail,
      claimantPhone: claimantPhone ? claimantPhone.trim() : '',
      reporterId: new mongoose.Types.ObjectId(reporterId),
      reporterName: item.reporterName || 'Item Reporter',
      reporterEmail: item.reporterEmail || '',
      reporterContactDetails: item.contactDetails || '',
      status: 'PENDING',
      attemptNumber: 1,
      proofMessage: proofMessage.trim(),
      messages: [initialMessage],
    });

    // 7. Publish CLAIM_SUBMITTED event to notification_exchange via RabbitMQ
    const claimId = newClaim._id;
    const itemTitle = newClaim.itemTitle;
    const itemType = newClaim.itemType;
    const reporterEmail = newClaim.reporterEmail;
    const recipientName = newClaim.reporterName;
    const proofPreview = newClaim.proofMessage;
    const submittedAt = newClaim.createdAt;

    try {
      await publishToExchange(
        rabbitmqConfig.exchanges?.NOTIFICATION_EXCHANGE || 'notification_exchange',
        'notification.claim_submitted',
        {
          event: 'CLAIM_SUBMITTED',
          claimId,
          itemId,
          itemTitle,
          itemType,
          recipientEmail: reporterEmail,
          recipientName,
          claimantName,
          proofPreview,
          submittedAt,
        },
        'topic'
      );
      console.log(`[Claim Service] Published CLAIM_SUBMITTED event for claim ${claimId} to notification_exchange`);
    } catch (publishError) {
      console.error(`[Claim Service] Failed to publish CLAIM_SUBMITTED event to RabbitMQ: ${publishError.message}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Claim request submitted successfully. The item reporter has been notified.',
      data: formatClaimForUser(newClaim, claimantId),
    });
  } catch (error) {
    console.error('[Claim Service] Error creating claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing claim submission',
      error: error.message,
    });
  }
};

/**
 * @desc    Get claim details by ID
 * @route   GET /api/v1/claims/:claimId
 * @access  Private (Claimant or Item Reporter only)
 */
const getClaimById = async (req, res) => {
  try {
    const { claimId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Claim ID format',
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found',
      });
    }

    // Strict Authorization: User must be claimant OR reporter
    const isClaimant = claim.claimantId.toString() === currentUserId.toString();
    const isReporter = claim.reporterId.toString() === currentUserId.toString();

    if (!isClaimant && !isReporter) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this claim.',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatClaimForUser(claim, currentUserId),
    });
  } catch (error) {
    console.error('[Claim Service] Error retrieving claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving claim',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all claims submitted by the current authenticated user (Claimant perspective)
 * @route   GET /api/v1/claims/my
 * @access  Private (Authenticated User only)
 */
const getMyClaims = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const claims = await Claim.find({
      claimantId: new mongoose.Types.ObjectId(currentUserId),
    }).sort({ createdAt: -1 });

    const formattedClaims = claims.map((c) => formatClaimForUser(c, currentUserId));

    return res.status(200).json({
      success: true,
      count: formattedClaims.length,
      data: formattedClaims,
    });
  } catch (error) {
    console.error('[Claim Service] Error fetching my claims:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching your submitted claims',
      error: error.message,
    });
  }
};

/**
 * @desc    Get incoming claim requests for items reported by the current user (Reporter perspective)
 * @route   GET /api/v1/claims/requests
 * @access  Private (Authenticated User only)
 */
const getIncomingClaimRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const claims = await Claim.find({
      reporterId: new mongoose.Types.ObjectId(currentUserId),
    }).sort({ createdAt: -1 });

    const formattedClaims = claims.map((c) => formatClaimForUser(c, currentUserId));

    return res.status(200).json({
      success: true,
      count: formattedClaims.length,
      data: formattedClaims,
    });
  } catch (error) {
    console.error('[Claim Service] Error fetching claim requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching incoming claim requests',
      error: error.message,
    });
  }
};

/**
 * @desc    Get claims associated with a specific item (for item detail modals / checking claim status)
 * @route   GET /api/v1/claims/item/:itemId
 * @access  Private
 */
const getClaimsForItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Item ID format',
      });
    }

    // Find all claims for this item
    const claims = await Claim.find({
      itemId: new mongoose.Types.ObjectId(itemId),
    }).sort({ createdAt: -1 });

    // Filter to claims user has permission to see
    const accessibleClaims = claims.filter(
      (c) =>
        c.reporterId.toString() === currentUserId.toString() ||
        c.claimantId.toString() === currentUserId.toString()
    );

    const formattedClaims = accessibleClaims.map((c) => formatClaimForUser(c, currentUserId));

    return res.status(200).json({
      success: true,
      count: formattedClaims.length,
      data: formattedClaims,
    });
  } catch (error) {
    console.error('[Claim Service] Error fetching claims for item:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching claims for item',
      error: error.message,
    });
  }
};

/**
 * @desc    Item reporter asks for more proof / follow-up question
 * @route   POST /api/v1/claims/:claimId/follow-up
 * @access  Private (Item Reporter only)
 */
const askFollowUp = async (req, res) => {
  try {
    const { claimId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    const { message, question } = req.body;
    const followUpText = (message || question || '').trim();

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Claim ID format',
      });
    }

    if (!followUpText) {
      return res.status(422).json({
        success: false,
        message: 'Please provide the question or details you would like the claimant to clarify.',
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found',
      });
    }

    // Strict Authorization: ONLY the reporter can ask for more proof
    if (claim.reporterId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the item reporter can request additional proof.',
      });
    }

    // State validation
    if (claim.status === 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'This claim has already been accepted.',
      });
    }

    if (claim.status === 'FINAL_REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'This claim has been permanently rejected.',
      });
    }

    // Update claim status & append question to conversation
    claim.status = 'FOLLOW_UP_REQUIRED';
    claim.messages.push({
      senderId: new mongoose.Types.ObjectId(currentUserId),
      senderRole: 'reporter',
      senderName: req.user.name || claim.reporterName,
      message: followUpText,
      createdAt: new Date(),
    });

    await claim.save();

    return res.status(200).json({
      success: true,
      message: 'Follow-up question sent to claimant.',
      data: formatClaimForUser(claim, currentUserId),
    });
  } catch (error) {
    console.error('[Claim Service] Error sending follow-up:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error requesting more proof',
      error: error.message,
    });
  }
};

/**
 * @desc    Claimant replies to a follow-up question
 * @route   POST /api/v1/claims/:claimId/reply
 * @access  Private (Claimant only)
 */
const replyFollowUp = async (req, res) => {
  try {
    const { claimId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    const { message, reply } = req.body;
    const replyText = (message || reply || '').trim();

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Claim ID format',
      });
    }

    if (!replyText) {
      return res.status(422).json({
        success: false,
        message: 'Please provide a response to the reporter question.',
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found',
      });
    }

    // Strict Authorization: ONLY the claimant can reply
    if (claim.claimantId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the claimant can respond to follow-up questions.',
      });
    }

    // State validation
    if (['ACCEPTED', 'REJECTED', 'FINAL_REJECTED'].includes(claim.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reply to a claim in ${claim.status} status.`,
      });
    }

    // Status returns to PENDING for the reporter to review
    claim.status = 'PENDING';
    claim.messages.push({
      senderId: new mongoose.Types.ObjectId(currentUserId),
      senderRole: 'claimant',
      senderName: req.user.name || claim.claimantName,
      message: replyText,
      createdAt: new Date(),
    });

    await claim.save();

    return res.status(200).json({
      success: true,
      message: 'Response sent to the item reporter.',
      data: formatClaimForUser(claim, currentUserId),
    });
  } catch (error) {
    console.error('[Claim Service] Error replying to follow-up:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error replying to follow-up',
      error: error.message,
    });
  }
};

/**
 * @desc    Reporter accepts ownership claim
 * @route   POST /api/v1/claims/:claimId/accept
 * @access  Private (Item Reporter only)
 */
const acceptClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    const { note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Claim ID format',
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found',
      });
    }

    // Strict Authorization: ONLY the item reporter can accept
    if (claim.reporterId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the item reporter can accept this claim.',
      });
    }

    if (claim.status === 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'This claim has already been accepted.',
      });
    }

    if (claim.status === 'FINAL_REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept a permanently rejected claim.',
      });
    }

    // 1. Mark claim as ACCEPTED
    claim.status = 'ACCEPTED';
    claim.decisionNote = (note || 'Claim accepted. Ownership verified.').trim();
    claim.decisionAt = new Date();

    claim.messages.push({
      senderId: new mongoose.Types.ObjectId(currentUserId),
      senderRole: 'reporter',
      senderName: req.user.name || claim.reporterName,
      message: note ? `[Claim Accepted] ${note.trim()}` : '[Claim Accepted] Ownership verified! You can now contact each other to arrange the return.',
      createdAt: new Date(),
    });

    await claim.save();

    // 2. Automatically close / reject any other pending claims for this item
    await Claim.updateMany(
      {
        itemId: claim.itemId,
        _id: { $ne: claim._id },
        status: { $in: ['PENDING', 'FOLLOW_UP_REQUIRED'] },
      },
      {
        $set: {
          status: 'REJECTED',
          rejectionReason: 'This item has been successfully claimed and verified by another user.',
          decisionAt: new Date(),
        },
      }
    );

    // 3. Update Item status in Item Service to 'claimed'
    await updateItemStatus(claim.itemId.toString(), 'claimed', req.authToken);

    return res.status(200).json({
      success: true,
      message: 'Claim successfully accepted! Both parties can now see mutual contact details to arrange return.',
      data: formatClaimForUser(claim, currentUserId),
    });
  } catch (error) {
    console.error('[Claim Service] Error accepting claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error accepting claim',
      error: error.message,
    });
  }
};

/**
 * @desc    Reporter rejects claim (Attempt 1 -> REJECTED, Attempt 2 -> FINAL_REJECTED)
 * @route   POST /api/v1/claims/:claimId/reject
 * @access  Private (Item Reporter only)
 */
const rejectClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    const { reason } = req.body;
    const rejectionNote = (reason || '').trim();

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Claim ID format',
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found',
      });
    }

    // Strict Authorization: ONLY the item reporter can reject
    if (claim.reporterId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the item reporter can reject this claim.',
      });
    }

    if (claim.status === 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already accepted claim.',
      });
    }

    if (claim.status === 'FINAL_REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'This claim is already permanently rejected.',
      });
    }

    // Determine rejection state based on attempt number
    if (claim.attemptNumber === 1) {
      // First attempt rejection: Claimant gets 1 more chance
      claim.status = 'REJECTED';
      claim.rejectionReason = rejectionNote || 'Ownership proof was not accepted';
      claim.decisionAt = new Date();

      claim.messages.push({
        senderId: new mongoose.Types.ObjectId(currentUserId),
        senderRole: 'reporter',
        senderName: req.user.name || claim.reporterName,
        message: rejectionNote
          ? `[Attempt 1 Rejected] ${rejectionNote}. You have ONE final attempt remaining.`
          : '[Attempt 1 Rejected] Your ownership proof was not accepted. You have ONE final attempt remaining. Please submit strong and specific proof of ownership.',
        createdAt: new Date(),
      });
    } else {
      // Second attempt rejection: Permanently blocked (FINAL_REJECTED)
      claim.status = 'FINAL_REJECTED';
      claim.rejectionReason = rejectionNote || 'Final ownership claim was rejected';
      claim.decisionAt = new Date();

      claim.messages.push({
        senderId: new mongoose.Types.ObjectId(currentUserId),
        senderRole: 'reporter',
        senderName: req.user.name || claim.reporterName,
        message: rejectionNote
          ? `[Final Attempt Rejected] ${rejectionNote}. You can no longer submit claims for this item.`
          : '[Final Attempt Rejected] Your final ownership claim was rejected. You can no longer submit another claim for this item.',
        createdAt: new Date(),
      });
    }

    await claim.save();

    return res.status(200).json({
      success: true,
      message:
        claim.status === 'FINAL_REJECTED'
          ? 'Final claim attempt rejected. Claimant is permanently blocked for this item.'
          : 'Claim proof rejected. Claimant has one final attempt remaining.',
      data: formatClaimForUser(claim, currentUserId),
    });
  } catch (error) {
    console.error('[Claim Service] Error rejecting claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error rejecting claim',
      error: error.message,
    });
  }
};

/**
 * @desc    Claimant submits second and final attempt after first rejection
 * @route   POST /api/v1/claims/:claimId/resubmit
 * @access  Private (Claimant only)
 */
const resubmitClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const currentUserId = req.user.id || req.user._id;
    const { proofMessage, claimantPhone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Claim ID format',
      });
    }

    if (!proofMessage || typeof proofMessage !== 'string' || !proofMessage.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Please provide strong and specific proof of ownership for your final attempt.',
      });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found',
      });
    }

    // Strict Authorization: ONLY the claimant can resubmit
    if (claim.claimantId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the claimant can resubmit a claim attempt.',
      });
    }

    // State validation
    if (claim.status === 'FINAL_REJECTED' || claim.attemptNumber >= 2) {
      return res.status(403).json({
        success: false,
        message: 'You have already exhausted all claim attempts for this item (maximum 2).',
      });
    }

    if (claim.status !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot resubmit a claim with current status "${claim.status}". Only rejected first attempts can be resubmitted.`,
      });
    }

    // Verify item is still unclaimed
    const item = await fetchItemById(claim.itemId.toString());
    if (!item || ['claimed', 'resolved', 'returned'].includes((item.status || '').toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: 'This item is no longer available for claims.',
      });
    }

    // Update to Attempt 2, Status PENDING
    claim.attemptNumber = 2;
    claim.status = 'PENDING';
    claim.proofMessage = proofMessage.trim();
    if (claimantPhone) {
      claim.claimantPhone = claimantPhone.trim();
    }

    claim.messages.push({
      senderId: new mongoose.Types.ObjectId(currentUserId),
      senderRole: 'claimant',
      senderName: req.user.name || claim.claimantName,
      message: `[Final Attempt 2/2] ${proofMessage.trim()}`,
      createdAt: new Date(),
    });

    await claim.save();

    return res.status(200).json({
      success: true,
      message: 'Final claim attempt submitted successfully. Awaiting reporter review.',
      data: formatClaimForUser(claim, currentUserId),
    });
  } catch (error) {
    console.error('[Claim Service] Error resubmitting claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error resubmitting final claim',
      error: error.message,
    });
  }
};

module.exports = {
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
};
