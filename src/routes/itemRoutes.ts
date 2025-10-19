import { Router } from 'express';
import {
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  getFilteredProducts,
} from '../controllers/itemController';
import multer, { StorageEngine } from "multer";
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
// Configure Multer
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// router.get('/', getItems);
router.get('/:productId', getItemById);
router.post('/', upload.array("images", 5), createItem);
router.put('/:productId', updateItem);
router.delete('/:productId', deleteItem);
router.get('/', getFilteredProducts);
export default router;