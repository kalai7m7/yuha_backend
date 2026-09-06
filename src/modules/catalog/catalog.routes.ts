import { Router } from 'express';
import {
  getCategoriesController,
  getFinishTypesController,
  getOccasionTypesController,
  getAllCatalogController
} from './catalog.controller';

export const catalogRouter = Router();

// All lookup data in one call — used by the frontend to populate filter dropdowns
catalogRouter.get('/', getAllCatalogController);

catalogRouter.get('/categories', getCategoriesController);
catalogRouter.get('/finish-types', getFinishTypesController);
catalogRouter.get('/occasion-types', getOccasionTypesController);
