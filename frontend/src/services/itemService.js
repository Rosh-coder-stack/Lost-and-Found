import axios from 'axios';

// Define the base URL for the API Gateway items route
const API_URL = import.meta.env.VITE_ITEM_API_URL || 'http://localhost:5000/api/v1/items';

/**
 * Helper to retrieve the active JWT token from localStorage.
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
 * Service function to submit a new Item Report (Lost or Found).
 *
 * @param {Object} itemData - The item report data
 * @param {string} [itemData.type] - 'lost' or 'found' (defaults to 'lost')
 * @param {string} itemData.title - Title/name of the item
 * @param {string} itemData.category - Item category
 * @param {string} itemData.description - Detailed description
 * @param {string} itemData.location - Last seen location or discovery spot
 * @param {string|Date} itemData.dateLost - Date/time the item was lost or found
 * @param {string} [itemData.imageUrl] - Optional image URL
 * @param {string} [itemData.distinguishingDetails] - Optional distinguishing features / safekeeping notes
 * @param {string} [itemData.contactPreference] - Contact preference (email, phone, app_chat)
 * @param {string} [itemData.contactDetails] - Optional contact details
 * @returns {Promise<Object>} The newly created item response
 */
export const createItemReport = async (itemData) => {
  try {
    const isFound = itemData.type === 'found';
    const endpoint = isFound ? `${API_URL}/found` : `${API_URL}/lost`;

    const normalizedData = {
      ...itemData,
      type: isFound ? 'found' : 'lost',
      dateLost: itemData.dateLost || itemData.dateFound || itemData.date || new Date().toISOString(),
      location: itemData.location || itemData.locationFound || itemData.foundLocation || '',
      distinguishingDetails: itemData.distinguishingDetails || itemData.safekeepingDetails || itemData.safekeeping || '',
    };

    const response = await axios.post(endpoint, normalizedData, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMsg =
        error.response.data.errors && error.response.data.errors.length > 0
          ? error.response.data.errors.join('. ')
          : error.response.data.message || 'Failed to submit report';
      throw new Error(errorMsg);
    } else if (error.request) {
      throw new Error('Unable to connect to the item service. Please ensure the backend is running.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while creating report');
    }
  }
};

/**
 * Service function to submit a new Lost Item Report.
 */
export const createLostItemReport = async (itemData) => {
  return createItemReport({ ...itemData, type: 'lost' });
};

/**
 * Service function to submit a new Found Item Report.
 */
export const createFoundItemReport = async (itemData) => {
  return createItemReport({ ...itemData, type: 'found' });
};

/**
 * Service function to fetch all reports created by the currently authenticated user.
 *
 * @returns {Promise<Array>} List of user reports
 */
export const getMyReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-reports`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch your reports');
    } else if (error.request) {
      throw new Error('Unable to connect to the item service. Please ensure the backend is running.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while fetching reports');
    }
  }
};

/**
 * Service function to fetch all public lost/found items for global browsing.
 *
 * @param {Object} [params] - Query parameters (search, category, status, type)
 * @returns {Promise<Array>} List of items
 */
export const getAllItems = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch items');
    } else if (error.request) {
      throw new Error('Unable to connect to the item service.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Service function to fetch a single item by ID.
 *
 * @param {string} id - The Item MongoDB ObjectId
 * @returns {Promise<Object>} Item details
 */
export const getItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch item details');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Service function to update an existing item report (Owner only).
 *
 * @param {string} id - The Item MongoDB ObjectId
 * @param {Object} itemData - The updated fields
 * @returns {Promise<Object>} Updated item response
 */
export const updateItemReport = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemData, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMsg =
        error.response.data.errors && error.response.data.errors.length > 0
          ? error.response.data.errors.join('. ')
          : error.response.data.message || 'Failed to update report';
      throw new Error(errorMsg);
    } else if (error.request) {
      throw new Error('Unable to connect to the item service. Please ensure the backend is running.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while updating report');
    }
  }
};

/**
 * Service function to delete an existing item report (Owner only).
 *
 * @param {string} id - The Item MongoDB ObjectId
 * @returns {Promise<Object>} Delete confirmation response
 */
export const deleteItemReport = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to delete report');
    } else if (error.request) {
      throw new Error('Unable to connect to the item service. Please ensure the backend is running.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while deleting report');
    }
  }
};

