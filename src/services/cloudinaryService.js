/**
 * Cloudinary Upload Service
 */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
import sha1 from 'js-sha1';

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn('Cloudinary configuration missing. File uploads will fail.');
}

const cloudinaryService = {
  /**
   * Upload file to Cloudinary
   * @param {File} file - The file to upload
   * @param {string} resourceType - 'image', 'video', 'raw' (default: 'auto')
   * @returns {Promise<Object>} Cloudinary response with secure_url
   */
  async uploadFile(file, resourceType = 'auto') {
    if (!file) throw new Error('No file provided');
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    formData.append('api_key', API_KEY);
    formData.append('resource_type', resourceType);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'File upload failed');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        public_id: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        resource_type: data.resource_type,
        original_filename: data.original_filename,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  /**
   * Upload multiple files to Cloudinary
   * @param {File[]} files - Array of files to upload
   * @param {string} resourceType - 'image', 'video', 'raw'
   * @returns {Promise<Object[]>} Array of Cloudinary responses
   */
  async uploadMultipleFiles(files, resourceType = 'auto') {
    if (!files || !files.length) throw new Error('No files provided');
    
    return Promise.all(
      files.map(file => this.uploadFile(file, resourceType))
    );
  },

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - The public_id of the file to delete
   * @returns {Promise<Object>} Cloudinary deletion response
   */
  async deleteFile(publicId) {
    if (!publicId) throw new Error('No publicId provided');
    if (!CLOUD_NAME || !API_KEY) {
      throw new Error('Cloudinary not configured for deletions');
    }

    const timestamp = Date.now();
    const signature = await this.generateSignature(publicId, timestamp);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            signature,
            api_key: API_KEY,
            timestamp,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'File deletion failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      throw new Error(`Deletion failed: ${error.message}`);
    }
  },

  // Helper method to generate signature (you might want to do this server-side)
 generateSignature(publicId, timestamp) {
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    return sha1(signatureStr);
  },
};

export default cloudinaryService;