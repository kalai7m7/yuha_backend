import { Router } from 'express';
import { getCategory, getCategoryById } from '../controllers/categoryController';

const categoryRouter = Router();

categoryRouter.get('/', getCategory);
categoryRouter.get('/:id', getCategoryById);

export default categoryRouter;