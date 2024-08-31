import { Request, Response, NextFunction } from "express";
import { asyncHandler, generateResponse, parseBody } from "../utils/helpers";
import { STATUS_CODES } from "../utils/constants";
import { UserService } from "../services";
import { IPaginationParams } from "../utils/interfaces";

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = parseBody(req.body);

    const userExists = await UserService.getOne({ email: body?.email });
    if (userExists) return next({
        statusCode: STATUS_CODES.CONFLICT,
        message: "User already exists",
    });

    const user: any = await UserService.create(body);

    const accessToken = await user.generateAccessToken();
    req.session = { accessToken };

    generateResponse({ user, accessToken, }, "Register successful", res);
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = parseBody(req.body);

    let user: any = await UserService.getOne({ email: body.email }, '+password');
    if (!user) return next({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: 'Invalid email or password'
    });

    const isMatch = await user.isPasswordCorrect(body.password);
    if (!isMatch) return next({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: 'Invalid password'
    });

    const accessToken = await user.generateAccessToken();
    req.session = { accessToken };

    user = await UserService.updateOne({ _id: user._id }, { fcmToken: body.fcmToken, name: 'User Testing11' }).select('+fcmtoken');

    generateResponse({ user, accessToken }, 'Login successful', res);
});

export const fetchAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, search = '' }: IPaginationParams = req.query;
    const query = {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ],
    };

    const usersData = await UserService.getAll({ query, page, limit });
    generateResponse(usersData, 'List fetched successfully', res);
});

export const fetchUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.getOne({ _id: req.user.id });
    generateResponse(user, 'User fetched successfully', res);
});