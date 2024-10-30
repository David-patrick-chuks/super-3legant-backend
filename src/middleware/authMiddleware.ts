import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string; // Optional userId property
    }
  }z
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
     res.status(403).json({ message: 'No token provided' })
     return
  }

  jwt.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Set the userId on the request object
    req.userId = (decoded as { userId: string }).userId; // Type assertion
    next(); // Call next to pass control to the next middleware
  });
};
