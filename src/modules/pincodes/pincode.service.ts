import { checkPincode, listAllPincodes } from './pincode.repository';

export async function verifyPincode(pincode: string) {
  return checkPincode(pincode);
}

export async function getAllPincodes() {
  return listAllPincodes();
}
