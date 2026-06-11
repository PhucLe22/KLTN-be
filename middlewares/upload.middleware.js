import multer from 'multer';
import { ERR } from '../lib/httpExceptions.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ERR.BadRequest('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadSingleImage = (fieldName) => upload.single(fieldName);
export const uploadMultipleImages = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
