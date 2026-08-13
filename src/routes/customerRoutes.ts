import { Router } from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController';

const customerRouter = Router();

customerRouter.get('/', getCustomers);
customerRouter.get('/:customerId', getCustomerById);

export default customerRouter;
