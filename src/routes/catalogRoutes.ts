import { Router } from 'express';
import { getCatalogData } from '../controllers/catalogController';

const catalogRouter = Router();

catalogRouter.get('/', getCatalogData);

export default catalogRouter;