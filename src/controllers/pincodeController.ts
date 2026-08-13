// src/controllers/pincodeController.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import logger from '../logger';

/**
 * GET /api/pincodes/:pincode
 * Returns { deliverable: true, city, state } if the pincode is active,
 * or { deliverable: false } if it is not found / inactive.
 */
export const checkPincode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { pincode } = req.params;

  if (!/^\d{6}$/.test(pincode)) {
    res.status(400).json({ deliverable: false, error: 'Invalid pincode format' });
    return;
  }

  try {
    const { rows } = await db.query(
      `SELECT pincode, city, state, is_active
       FROM delivery_pincodes
       WHERE pincode = $1`,
      [pincode],
    );

    if (!rows.length || !rows[0].is_active) {
      res.json({ deliverable: false });
      return;
    }

    const { city, state } = rows[0];
    res.json({ deliverable: true, city, state });
  } catch (err) {
    logger.error(`❌ [PINCODE] Error checking pincode ${pincode}: ${(err as Error).message}`);
    next(err);
  }
};
