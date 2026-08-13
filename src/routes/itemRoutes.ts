import { Router } from 'express';
import {
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  getFilteredProducts,
} from '../controllers/itemController';
import multer from 'multer';

const itemRouter = Router();

// Use memory storage — files are kept as buffers and uploaded to Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });

itemRouter.get('/', getFilteredProducts);
itemRouter.get('/:productId', getItemById);
itemRouter.post('/', upload.array('images', 5), createItem);
itemRouter.put('/:productId', upload.array('images'), updateItem);
itemRouter.delete('/:productId', deleteItem);

export default itemRouter;
