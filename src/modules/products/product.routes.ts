import { Router, ErrorRequestHandler } from 'express';
import multer, { MulterError } from 'multer';
import {
  listProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  uploadProductImagesController,
} from './product.controller';

export const MAX_IMAGES = 5;
export const MAX_FILE_SIZE_MB = 2;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_IMAGES,
  },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP.`));
    }
  },
});

// Translate multer errors into the standard AppError JSON envelope
const handleMulterError: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: { code: 'IMAGE_TOO_LARGE', message: `Each image must be ${MAX_FILE_SIZE_MB}MB or smaller.` },
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: { code: 'TOO_MANY_IMAGES', message: `You can upload a maximum of ${MAX_IMAGES} images per product.` },
      });
      return;
    }
    res.status(400).json({ success: false, error: { code: 'UPLOAD_ERROR', message: err.message } });
    return;
  }
  if (err instanceof Error && err.message.startsWith('Unsupported file type')) {
    res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: err.message } });
    return;
  }
  next(err);
};

const uploadImages = upload.array('images', MAX_IMAGES);

export const productRouter = Router();

productRouter.get('/', listProductsController);
productRouter.get('/:id', getProductController);
productRouter.post('/', uploadImages, handleMulterError, createProductController);
productRouter.put('/:id', uploadImages, handleMulterError, updateProductController);
productRouter.post('/:id/images', uploadImages, handleMulterError, uploadProductImagesController);
productRouter.delete('/:id', deleteProductController);
