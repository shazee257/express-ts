import { Request, Response, NextFunction } from "express";
import { asyncHandler, generateResponse, parseBody } from "../utils/helpers";
import { ROLES, STATUS_CODES } from "../utils/constants";
import { UserService } from "../services";

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

    // let user = await findUser({ email: body?.email }).select('+password');
    let user: any = await UserService.getOne({ email: body?.email }).select('+password');
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

    // remove password
    user = user.toObject();
    delete user.password;

    generateResponse({ user, accessToken }, 'Login successful', res);
});

export const fetchAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page: number = +(req.query.page || 1);
    const limit: number = +(req.query.limit || 10);
    const query = {};

    const usersData = await UserService.getAll({ query, page, limit });
    generateResponse(usersData, 'List fetched successfully', res);
});

export const fetchUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = '66ca31c45ea6c0c2b6f9dad1';

    const user = await UserService.getOne({ _id: userId });
    generateResponse(user, 'User fetched successfully', res);
});