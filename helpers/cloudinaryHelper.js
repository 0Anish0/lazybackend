// Import the Cloudinary SDK 
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary from a buffer.
 * @param {Buffer} fileBuffer - The buffer of the image to upload.
 * @param {string} fileName - The name of the file to save as in Cloudinary (optional).
 * @param {object} options - Options for the Cloudinary upload (e.g., folder name).
 * @returns {Promise<object>} - Uploaded file data including URL and public ID.
 */
const uploadImage = async (fileBuffer, fileName, options = {}) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    ...options, // Additional options (e.g., folder name)
                    public_id: fileName,  // Optional: Set the public ID of the image
                },
                (error, result) => {
                    if (error) {
                        reject(new Error('Error uploading to Cloudinary: ' + error.message));
                    } else {
                        resolve({
                            url: result.secure_url,  // Public URL of the uploaded image
                            public_id: result.public_id,  // Public ID for managing the resource
                        });
                    }
                }
            );

            // Pipe the file buffer data to Cloudinary's upload stream
            uploadStream.end(fileBuffer);
        });
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