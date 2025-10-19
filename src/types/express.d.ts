// backend/types/express.d.ts
import { FileArray } from "express-fileupload";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
