import { listProducts } from './product.repository';

export async function getProducts() {
  return listProducts();
}
