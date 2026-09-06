import { Request, Response } from 'express';
import { getCategories, getFinishTypes, getOccasionTypes, getAllCatalog } from './catalog.service';

export async function getCategoriesController(_req: Request, res: Response) {
  const data = await getCategories();
  res.json({ success: true, data });
}

export async function getFinishTypesController(_req: Request, res: Response) {
  const data = await getFinishTypes();
  res.json({ success: true, data });
}

export async function getOccasionTypesController(_req: Request, res: Response) {
  const data = await getOccasionTypes();
  res.json({ success: true, data });
}

export async function getAllCatalogController(_req: Request, res: Response) {
  const data = await getAllCatalog();
  res.json({ success: true, data });
}
