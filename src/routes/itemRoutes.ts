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

const itemRouter = Router();

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

itemRouter.get('/:productId', getItemById);
itemRouter.post('/', upload.array("images", 5), createItem);
itemRouter.put('/:productId', updateItem);
itemRouter.delete('/:productId', deleteItem);
itemRouter.get('/', getFilteredProducts);
export default itemRouter;