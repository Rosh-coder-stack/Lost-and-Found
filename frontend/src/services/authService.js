import axios from 'axios';

// Define the base URL for the Auth Service API
const API_URL = 'http://localhost:5001/api/v1/auth';

/**
 * Service function to authenticate a user by sending email and password to the backend API.
 * 
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<Object>} The response data containing token, user info, and message
 */
export const loginUser = async (email, password) => {
  try {
    // Step 1: Make an HTTP POST request to the login endpoint
    // Endpoint: POST http://localhost:5001/api/v1/auth/login
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    // Step 2: Return the response data payload received from backend
    return response.data;
  } catch (error) {
    // Step 3: Handle HTTP errors returned from the server (e.g., 400, 401, 404, 500)
    if (error.response && error.response.data) {
      // Return the specific message sent by the backend (e.g., "User not found", "Invalid credentials")
      throw new Error(error.response.data.message || 'Authentication failed');
    } else if (error.request) {
      // Request was sent but no response was received (Network issue or backend server down)
      throw new Error('Unable to connect to the authentication server. Please ensure the backend is running.');
    } else {
      // General error during setup
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};
