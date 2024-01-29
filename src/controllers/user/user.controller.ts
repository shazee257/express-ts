import { Request, Response, NextFunction } from "express";
import { asyncHandler, generateResponse, parseBody } from "../../utils/helpers";
import { IUser, createUser, findUser, getAllUsers } from "../../models";
import { ROLES, STATUS_CODES } from "../../utils/constants";

// register user
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = parseBody(req.body);

    const userExists = await findUser({ email: body?.email });
    if (userExists) return next({
        statusCode: STATUS_CODES.CONFLICT,
        message: "User already exists",
    });

    const user = await createUser(body);

    const accessToken = await user.generateAccessToken();
    req.session = { accessToken };

    generateResponse({ user, accessToken, }, "Register successful", res);
});

// login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = parseBody(req.body);

    let user = await findUser({ email: body?.email }).select('+password');
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

// get all users
export const fetchAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page: number = +(req.query.page || 1);
    const limit = +(req.query.limit || 10);
    const query = { role: { $ne: ROLES.ADMIN } };

    const usersData = await getAllUsers({ query, page, limit });
    if (usersData?.data?.length === 0) {
        generateResponse(null, 'No user found', res);
        return;
    }

    generateResponse(usersData, 'List fetched successfully', res);
});