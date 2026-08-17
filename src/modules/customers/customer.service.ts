import { listCustomers, getCustomerById } from './customer.repository';

export async function getAllCustomers() {
  return listCustomers();
}

export async function getCustomer(id: string) {
  return getCustomerById(id);
}
