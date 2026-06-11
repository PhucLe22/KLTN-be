import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads an image to Cloudinary
 * @param {string} imagePath - Path to the image file or base64 string
 * @param {string} folder - Optional folder in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImage = async (imagePath, folder = 'products') => {
  const options = {
    use_filename: true,
    unique_filename: true,
    overwrite: true,
    folder: folder,
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Uploads an image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Optional folder in Cloudinary
 * @param {Object} options - Additional Cloudinary upload options (e.g. public_id)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadFromBuffer = (buffer, folder = 'products', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} - Cloudinary delete result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default cloudinary;
