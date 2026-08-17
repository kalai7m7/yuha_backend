import { Router } from 'express';
import { listCustomersController, getCustomerController } from './customer.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

export const customerRouter = Router();

customerRouter.get('/', requireAuth, requireAdmin, listCustomersController);
customerRouter.get('/:id', requireAuth, requireAdmin, getCustomerController);
