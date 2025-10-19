import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getProducts,
  getFilteredProducts,
} from '../controllers/itemController';
import { db } from '../db';

const router = Router();

// router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.get('/', getFilteredProducts);
export default router;