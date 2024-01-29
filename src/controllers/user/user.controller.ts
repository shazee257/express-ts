import { compare, hash } from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { asyncHandler, generateAccessToken, generateResponse, parseBody } from "../../utils/helpers";
import { createUser, findUser, getAllUsers } from "../../models";
import { ROLES, STATUS_CODES } from "../../utils/constants";
import { IUser } from "../../utils/interfaces";

// register user
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = parseBody(req.body);

    try {
        const userExists = await findUser({ email: body?.email });
        if (userExists) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: "User already exists",
        });

        // hash password
        const hashedPassword = await hash(body.password, 10);
        body.password = hashedPassword;

        const user = await createUser(body);

        const accessToken = generateAccessToken(user);
        req.session = { accessToken };

        generateResponse({ user, accessToken, }, "Register successful", res);
    } catch (error) {
        next(error);
    }
});

// create default admin
export const createDefaultAdmin = async () => {
    try {
        const userExist = await findUser({ email: process.env.ADMIN_DEFAULT_EMAIL, role: ROLES.ADMIN });
        if (userExist) {
            console.log('admin exists ->', userExist.email);
            return
        };

        console.log('admin not exist');
        const password = await hash(process.env.ADMIN_DEFAULT_PASSWORD as string, 10);

        // create default admin
        await createUser({
            name: 'Admin',
            email: process.env.ADMIN_DEFAULT_EMAIL,
            password,
            role: ROLES.ADMIN
        });

        console.log('Admin default created successfully');
    } catch (error) {
        console.log('error - create default admin -> ', error);
    }
};

// login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = parseBody(req.body);

    try {
        let user: any = await findUser({ email: body?.email }).select('+password');
        if (!user) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Invalid email or password'
        });

        const isMatch = await compare(body.password, user.password);
        if (!isMatch) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Invalid password'
        });

        // remove password
        // user = user.toObject();
        // delete user.password;

        const accessToken = generateAccessToken(user);
        req.session = { accessToken };

        generateResponse({ user, accessToken }, 'Login successful', res);
    } catch (error) {
        next(error);
    }
});

// get all users
export const fetchAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page: number = +(req.query.page || 1);
    const limit = +(req.query.limit || 10);
    // const query = { role: { $ne: ROLES.ADMIN } };

    try {
        const usersData = await getAllUsers({ page, limit });
        if (usersData?.data?.length === 0) {
            generateResponse(null, 'No user found', res);
            return;
        }

        generateResponse(usersData, 'List fetched successfully', res);
    } catch (error) {
        next(error);
    }


});