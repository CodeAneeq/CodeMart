import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Constants from '../constant.js';

// Use cloudinary.v2 for the latest stable API in version 1.x
const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
    cloud_name: Constants.CLOUD_NAME,
    api_key: Constants.API_KEY,
    api_secret: Constants.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryV2,
    params: {
        folder: 'codemart',
        allowedFormats: ['jpg', 'png', 'jpeg'],
        // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

export { cloudinaryV2 as cloudinary, storage };
