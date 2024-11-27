// Import the Cloudinary SDK
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary.
 * @param {string} filePath - The local path of the file to upload.
 * @param {object} options - Options for the Cloudinary upload (e.g., folder name).
 * @returns {Promise<object>} - Uploaded file data including URL and public ID.
 */
const uploadImage = async (filePath, options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, options);
        return {
            url: result.secure_url, // Public URL of the uploaded image
            public_id: result.public_id, // Public ID for managing the resource
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error.message);
        throw new Error(error.message);
    }
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The Cloudinary public ID of the image to delete.
 * @returns {Promise<object>} - Deletion result.
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result; // { result: 'ok' } if successful
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error.message);
        throw new Error(error.message);
    }
};

// Export the helper functions
module.exports = {
    uploadImage,
    deleteImage,
};