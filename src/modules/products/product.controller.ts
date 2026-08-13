import { Request, Response } from 'express';
import { getProducts, getProduct, addProduct, editProduct, removeProduct } from './product.service';
import { ProductFilters } from './product.repository';

export async function listProductsController(req: Request, res: Response) {
  const filters: ProductFilters = {
    category: req.query.category as string | undefined,
    finish_type: req.query.finish_type as string | undefined,
    occasion_type: req.query.occasion_type as string | undefined,
    sort_by: req.query.sort_by as ProductFilters['sort_by'],
    is_available: req.query.is_available !== undefined
      ? req.query.is_available === 'true'
      : undefined
  };

  const products = await getProducts(filters);
  res.json({ success: true, data: products });
}

export async function getProductController(req: Request, res: Response) {
  const product = await getProduct(req.params.id);
  res.json({ success: true, data: product });
}

export async function createProductController(req: Request, res: Response) {
  const product = await addProduct(req.body);
  res.status(201).json({ success: true, data: product });
}

export async function updateProductController(req: Request, res: Response) {
  const product = await editProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
}

export async function deleteProductController(req: Request, res: Response) {
  await removeProduct(req.params.id);
  res.json({ success: true, data: null });
}
