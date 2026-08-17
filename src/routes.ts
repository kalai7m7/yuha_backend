import { Router } from 'express';
import { productRouter } from './modules/products/product.routes';
import { catalogRouter } from './modules/catalog/catalog.routes';
import { authRouter } from './modules/auth/auth.routes';
import { pincodeRouter } from './modules/pincodes/pincode.routes';
import { orderRouter } from './modules/orders/order.routes';
import { customerRouter } from './modules/customers/customer.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/catalog', catalogRouter);
apiRouter.use('/pincodes', pincodeRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/customers', customerRouter);
