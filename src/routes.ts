import { Router } from 'express';
import { productRouter } from './modules/products/product.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';

export const apiRouter = Router();

apiRouter.use('/products', productRouter);
apiRouter.use('/catalog', catalogRouter);
