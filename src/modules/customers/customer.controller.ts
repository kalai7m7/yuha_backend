import { Request, Response } from 'express';
import { getAllCustomers, getCustomer } from './customer.service';

export async function listCustomersController(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await getAllCustomers({ page, limit });
  res.json({ success: true, data: result });
}

export async function getCustomerController(req: Request, res: Response) {
  const customer = await getCustomer(req.params.id as string);
  res.json({ success: true, data: customer });
}
