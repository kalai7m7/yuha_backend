import { Router } from 'express';
import { listProductsController } from './product.controller';

export const productRouter = Router();

productRouter.get('/', listProductsController);
