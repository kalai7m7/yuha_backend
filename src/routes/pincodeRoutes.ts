import { Router } from 'express';
import { checkPincode } from '../controllers/pincodeController';

const pincodeRouter = Router();

pincodeRouter.get('/:pincode', checkPincode);

export default pincodeRouter;
