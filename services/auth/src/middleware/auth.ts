import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    user: {
        id: number;
        role: string;
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload['user'];
        }
    }
}

// @ts-ignore
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'No token provided' });

    // @ts-ignore
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user as UserPayload['user'];
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

// @ts-ignore
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
};

// @ts-ignore
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Resource not found' });
};