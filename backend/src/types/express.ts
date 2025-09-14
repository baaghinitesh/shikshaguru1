import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IUser } from './index';

export interface AuthRequest extends Request {
  user?: IUser;
}

export type AuthRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AuthMiddleware = RequestHandler;

// Helper to cast any function as RequestHandler
export const asHandler = (fn: any): RequestHandler => fn as RequestHandler;