/**
 * Cloudinary Upload Service
 * Handles direct unsigned client-side image uploads to Cloudinary.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Allowed image formats
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
// 5 MB maximum file size limit
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Validates the image file before upload.
 * @param {File} file
 * @throws {Error} If validation fails
 */
export const validateImageFile = (file) => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image file size exceeds the 5MB limit. Please choose a smaller image.');
  }
};

/**
 * Uploads an image file directly to Cloudinary using an unsigned upload preset.
 * 
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The secure_url returned by Cloudinary
 */
export const uploadImageToCloudinary = async (file) => {
  validateImageFile(file);

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary configuration is missing. Please ensure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are set.'
    );
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail = data?.error?.message || response.statusText || 'Upload failed';
      throw new Error(`Cloudinary upload failed: ${errorDetail}`);
    }

    if (!data.secure_url) {
      throw new Error('Cloudinary did not return a secure URL.');
    }

    return data.secure_url;
  } catch (error) {
    if (error.message && (error.message.startsWith('Cloudinary') || error.message.startsWith('Invalid') || error.message.startsWith('Image file size'))) {
      throw error;
    }
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
