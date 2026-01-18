import { AdminPayload } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: AdminPayload;
    }
  }
}

export {};
