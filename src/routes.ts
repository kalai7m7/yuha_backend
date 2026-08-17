import { Router } from 'express';
import { productRouter } from './modules/products/product.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { authRouter } from './modules/auth/auth.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/catalog', catalogRouter);
