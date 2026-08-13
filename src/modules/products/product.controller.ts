import { Request, Response } from 'express';
import { getProducts } from './product.service';

export async function listProductsController(_req: Request, res: Response) {
  const products = await getProducts();

  res.json({
    success: true,
    data: products
  });
}
