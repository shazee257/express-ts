import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { STATUS_CODES } from '../utils/constants';
import { UserService } from '../services';

export default function authMiddleware(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers.authorization?.split(' ')[1] ?? req.session?.accessToken;
        if (!accessToken) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Authorization failed!'
        });

        verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: any, decoded: any) => {
            if (err) return next({
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: 'Invalid token!'
            });

            req.user = { ...decoded };

            const user = await UserService.getOne({ _id: req.user.id });
            if (!user) return next({
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: 'Unauthorized access!'
            });

            if (!roles.includes(req.user.role)) return next({
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: 'Unauthorized access!'
            });

            // next middleware is called
            next();
        });
    }
}