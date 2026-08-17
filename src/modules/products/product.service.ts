import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
} from './product.repository';
import { uploadProductImages, deleteProductImages } from './product-image.service';

export async function getProducts(filters: ProductFilters) {
  return listProducts(filters);
}

export async function getProduct(id: string) {
  return getProductById(id);
}

export async function addProduct(
  input: CreateProductInput,
  files?: Express.Multer.File[]
) {
  const product = await createProduct(input);
  if (files && files.length > 0) {
    await uploadProductImages(product.id, files);
    return getProductById(product.id);
  }
  return product;
}

export async function editProduct(
  id: string,
  input: UpdateProductInput,
  files?: Express.Multer.File[],
  deletedImageIds?: string[]
) {
  if (deletedImageIds && deletedImageIds.length > 0) {
    await deleteProductImages(deletedImageIds);
  }

  await updateProduct(id, input);

  if (files && files.length > 0) {
    await uploadProductImages(id, files);
  }

  return getProductById(id);
}

export async function addProductImages(
  id: string,
  files: Express.Multer.File[]
) {
  await getProductById(id); // Ensure product exists
  return uploadProductImages(id, files);
}

export async function removeProduct(id: string) {
  return deleteProduct(id);
}
