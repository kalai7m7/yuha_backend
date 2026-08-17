import { Request, Response } from 'express';
import { getAllCustomers, getCustomer } from './customer.service';

export async function listCustomersController(_req: Request, res: Response) {
  const customers = await getAllCustomers();
  res.json({ success: true, data: customers });
}

export async function getCustomerController(req: Request, res: Response) {
  const customer = await getCustomer(req.params.id as string);
  res.json({ success: true, data: customer });
}
