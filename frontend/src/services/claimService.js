import axios from 'axios';

// Base URL for API Gateway claims endpoint
const API_URL = import.meta.env.VITE_CLAIM_API_URL || 'http://localhost:5000/api/v1/claims';

/**
 * Helper to retrieve active JWT token from localStorage.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Service function to submit a new ownership claim for an item (Attempt 1).
 *
 * @param {Object} claimData
 * @param {string} claimData.itemId - The MongoDB ID of the item being claimed
 * @param {string} claimData.proofMessage - Detailed proof of ownership
 * @param {string} [claimData.claimantPhone] - Optional phone/contact details
 * @returns {Promise<Object>} Created claim response
 */
export const createClaim = async ({ itemId, proofMessage, claimantPhone }) => {
  try {
    const response = await axios.post(
      API_URL,
      { itemId, proofMessage, claimantPhone },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to submit claim request');
    } else if (error.request) {
      throw new Error('Unable to connect to claim service. Please check your network or server status.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while submitting claim');
    }
  }
};

/**
 * Service function to fetch a single claim by its ID.
 *
 * @param {string} claimId
 * @returns {Promise<Object>} Claim details
 */
export const getClaimById = async (claimId) => {
  try {
    const response = await axios.get(`${API_URL}/${claimId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch claim details');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Service function to fetch all claims submitted by current user (Claimant perspective).
 *
 * @returns {Promise<Object>} List of submitted claims
 */
export const getMyClaims = async () => {
  try {
    const response = await axios.get(`${API_URL}/my`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch your submitted claims');
    } else if (error.request) {
      throw new Error('Unable to connect to claim service.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Service function to fetch incoming claim requests on items reported by current user (Reporter perspective).
 *
 * @returns {Promise<Object>} List of incoming claim requests
 */
export const getIncomingClaimRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch incoming claim requests');
    } else if (error.request) {
      throw new Error('Unable to connect to claim service.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Service function to fetch claims for a specific item.
 *
 * @param {string} itemId
 * @returns {Promise<Object>} List of claims for item
 */
export const getClaimsForItem = async (itemId) => {
  try {
    const response = await axios.get(`${API_URL}/item/${itemId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch claims for item');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Item Reporter asks for more proof / follow-up question.
 *
 * @param {string} claimId
 * @param {string} message
 * @returns {Promise<Object>}
 */
export const askFollowUpProof = async (claimId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/${claimId}/follow-up`,
      { message },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to send follow-up question');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Claimant replies to follow-up question.
 *
 * @param {string} claimId
 * @param {string} message
 * @returns {Promise<Object>}
 */
export const replyFollowUpProof = async (claimId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/${claimId}/reply`,
      { message },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to send reply');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Item Reporter accepts claim (ownership verified).
 *
 * @param {string} claimId
 * @param {string} [note]
 * @returns {Promise<Object>}
 */
export const acceptClaim = async (claimId, note = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/${claimId}/accept`,
      { note },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to accept claim');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Item Reporter rejects claim.
 *
 * @param {string} claimId
 * @param {string} [reason]
 * @returns {Promise<Object>}
 */
export const rejectClaim = async (claimId, reason = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/${claimId}/reject`,
      { reason },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to reject claim');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Claimant resubmits second and final attempt after first rejection.
 *
 * @param {string} claimId
 * @param {Object} data
 * @param {string} data.proofMessage
 * @param {string} [data.claimantPhone]
 * @returns {Promise<Object>}
 */
export const resubmitClaim = async (claimId, { proofMessage, claimantPhone }) => {
  try {
    const response = await axios.post(
      `${API_URL}/${claimId}/resubmit`,
      { proofMessage, claimantPhone },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to resubmit claim');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};
