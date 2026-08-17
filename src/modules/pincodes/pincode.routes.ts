import { Router } from 'express';
import { checkPincodeController, listPincodesController } from './pincode.controller';

export const pincodeRouter = Router();

pincodeRouter.get('/', listPincodesController);
pincodeRouter.get('/:pincode', checkPincodeController);
