import { Request, Response } from 'express';
import {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  addProductImages,
} from './product.service';
import { ProductFilters, CreateProductInput, UpdateProductInput } from './product.repository';

export async function listProductsController(req: Request, res: Response) {
  const filters: ProductFilters = {
    category: req.query.category as string | undefined,
    finish_type: req.query.finish_type as string | undefined,
    occasion_type: req.query.occasion_type as string | undefined,
    sort_by: req.query.sort_by as ProductFilters['sort_by'],
    is_available: req.query.is_available !== undefined
      ? req.query.is_available === 'true'
      : undefined,
    has_offer: req.query.has_offer === 'true' ? true : undefined,
    search: req.query.search as string | undefined,
    price_min: req.query.price_min !== undefined
      ? Number(req.query.price_min)
      : undefined,
    price_max: req.query.price_max !== undefined
      ? Number(req.query.price_max)
      : undefined,
    limit: req.query.limit !== undefined ? Number(req.query.limit) : 12,
    offset: req.query.offset !== undefined ? Number(req.query.offset) : 0,
  };

  const result = await getProducts(filters);
  res.json({ success: true, data: result.data, total: result.total });
}

export async function getProductController(req: Request, res: Response) {
  const product = await getProduct(req.params.id as string);
  res.json({ success: true, data: product });
}

export async function createProductController(req: Request, res: Response) {
  const body = req.body;
  const input: CreateProductInput = {
    name: body.name || body.p_name,
    description: body.description || undefined,
    short_description: body.short_description || undefined,
    price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
    offer_price: body.offer_price ? (typeof body.offer_price === 'string' ? parseFloat(body.offer_price) : body.offer_price) : undefined,
    offer_label: body.offer_label || undefined,
    stock_quantity: body.stock_quantity ? (typeof body.stock_quantity === 'string' ? parseInt(body.stock_quantity, 10) : body.stock_quantity) : (body.count ? (typeof body.count === 'string' ? parseInt(body.count, 10) : body.count) : 0),
    delivery_time: body.delivery_time || undefined,
    category_id: body.category_id || undefined,
    finish_type_id: body.finish_type_id || undefined,
    occasion_type_id: body.occasion_type_id || undefined,
  };

  const files = (req.files as Express.Multer.File[]) || [];
  const product = await addProduct(input, files);
  res.status(201).json({ success: true, data: product });
}

export async function updateProductController(req: Request, res: Response) {
  const body = req.body;
  const input: UpdateProductInput = {
    name: body.name || body.p_name || undefined,
    description: body.description !== undefined ? body.description : undefined,
    short_description: body.short_description !== undefined ? body.short_description : undefined,
    price: body.price !== undefined ? (typeof body.price === 'string' ? parseFloat(body.price) : body.price) : undefined,
    offer_price: body.offer_price !== undefined ? (body.offer_price ? parseFloat(body.offer_price) : null) : undefined,
    offer_label: body.offer_label !== undefined ? body.offer_label : undefined,
    stock_quantity: body.stock_quantity !== undefined ? (typeof body.stock_quantity === 'string' ? parseInt(body.stock_quantity, 10) : body.stock_quantity) : (body.count !== undefined ? parseInt(body.count, 10) : undefined),
    delivery_time: body.delivery_time !== undefined ? body.delivery_time : undefined,
    category_id: body.category_id !== undefined ? body.category_id : undefined,
    finish_type_id: body.finish_type_id !== undefined ? body.finish_type_id : undefined,
    occasion_type_id: body.occasion_type_id !== undefined ? body.occasion_type_id : undefined,
    is_active: body.is_active !== undefined ? (body.is_active === 'true' || body.is_active === true) : undefined,
  };

  const files = (req.files as Express.Multer.File[]) || [];
  const deletedImageIds = body.deleted_image_ids
    ? (Array.isArray(body.deleted_image_ids) ? body.deleted_image_ids : [body.deleted_image_ids])
    : [];

  const product = await editProduct(req.params.id as string, input, files, deletedImageIds);
  res.json({ success: true, data: product });
}

export async function uploadProductImagesController(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) || [];
  const images = await addProductImages(req.params.id as string, files);
  res.status(201).json({ success: true, data: images });
}

export async function deleteProductController(req: Request, res: Response) {
  await removeProduct(req.params.id as string);
  res.json({ success: true, data: null });
}
