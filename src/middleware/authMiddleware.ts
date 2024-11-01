import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return;
  }

  (jwt.verify as (
    token: string,
    secretOrPublicKey: jwt.Secret,
    callback: (err: VerifyErrors | null, decoded: JwtPayload | undefined) => void
  ) => void)(token, process.env.JWT_SECRET || '', (err: VerifyErrors | null, decoded: JwtPayload | undefined) => {
    if (err) {
      // Check for token expiration error specifically
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (decoded) {
      req.userId = (decoded as JwtPayload).userId;
    }
    next();
  });
};
