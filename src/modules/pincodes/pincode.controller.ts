import { Request, Response } from 'express';
import { verifyPincode, getAllPincodes } from './pincode.service';
import { AppError } from '../../shared/errors/AppError';

export async function checkPincodeController(req: Request, res: Response) {
  const pincode = req.params.pincode as string;
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    throw new AppError(400, 'A valid 6-digit pincode is required', 'INVALID_PINCODE');
  }

  const result = await verifyPincode(pincode);
  res.json({ success: true, data: result, ...result });
}

export async function listPincodesController(_req: Request, res: Response) {
  const pincodes = await getAllPincodes();
  res.json({ success: true, data: pincodes });
}
