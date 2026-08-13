import { Router } from 'express';
import {
  listProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController
} from './product.controller';

export const productRouter = Router();

productRouter.get('/', listProductsController);
productRouter.get('/:id', getProductController);
productRouter.post('/', createProductController);
productRouter.put('/:id', updateProductController);
productRouter.delete('/:id', deleteProductController);
