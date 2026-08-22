const config = require('../config');

/**
 * Service client to interact with Item Service via REST API
 */
const fetchItemById = async (itemId) => {
  try {
    const url = `${config.itemServiceUrl}/api/v1/items/${itemId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Item Service returned status ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`[Claim Service Client] Failed to fetch item ${itemId}:`, error.message);
    throw error;
  }
};

/**
 * Service client to update item status in Item Service
 */
const updateItemStatus = async (itemId, status, authToken) => {
  try {
    const url = `${config.itemServiceUrl}/api/v1/items/${itemId}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn(`[Claim Service Client] Could not update item status: ${errData.message || response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[Claim Service Client] Error updating item ${itemId} status:`, error.message);
    return false;
  }
};

/**
 * Service client to fetch user profile from Auth Service
 */
const fetchUserById = async (userId) => {
  try {
    const url = `${config.authServiceUrl}/api/v1/auth/users/${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`[Claim Service Client] Failed to fetch user ${userId}:`, error.message);
    return null;
  }
};

module.exports = {
  fetchItemById,
  updateItemStatus,
  fetchUserById,
};
