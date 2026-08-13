import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput
} from './product.repository';

export async function getProducts(filters: ProductFilters) {
  return listProducts(filters);
}

export async function getProduct(id: string) {
  return getProductById(id);
}

export async function addProduct(input: CreateProductInput) {
  return createProduct(input);
}

export async function editProduct(id: string, input: UpdateProductInput) {
  return updateProduct(id, input);
}

export async function removeProduct(id: string) {
  return deleteProduct(id);
}
