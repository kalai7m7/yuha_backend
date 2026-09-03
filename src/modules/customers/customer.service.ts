import { listCustomers, getCustomerById, PaginationOptions } from './customer.repository';

export async function getAllCustomers(opts: PaginationOptions = {}) {
  return listCustomers(opts);
}

export async function getCustomer(id: string) {
  return getCustomerById(id);
}
