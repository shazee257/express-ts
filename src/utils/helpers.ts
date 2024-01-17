import { Response } from 'express';
import jwt from 'jsonwebtoken';

// generate response with status code
export const generateResponse = (data: any, message: string, res: Response, code = 200) => {
    return res.status(code).json({
        statusCode: code,
        message,
        data,
    });
}

// parse body to object or json (if body is string)
export const parseBody = (body: any) => {
    if (typeof body === 'string') {
        return JSON.parse(body);
    }

    return body;
}

// pagination with mongoose paginate library
// export const getMongoosePaginatedData = async ({
//     model, page = 1, limit = 10, query = {}, populate = '', select = '-password', sort = { createdAt: -1 },
// }) => {
//     const options = {
//         select,
//         sort,
//         populate,
//         lean: true,
//         page,
//         limit,
//         customLabels: {
//             totalDocs: 'totalItems',
//             docs: 'data',
//             limit: 'perPage',
//             page: 'currentPage',
//             meta: 'pagination',
//         },
//     };

//     const { data, pagination } = await model.paginate(query, options);
//     delete pagination?.pagingCounter;

//     return { data, pagination };
// }

// aggregate pagination with mongoose paginate library
// export const getMongooseAggregatePaginatedData = async ({ model, page = 1, limit = 10, query = [] }) => {
//     const options = {
//         page,
//         limit,
//         customLabels: {
//             totalDocs: 'totalItems',
//             docs: 'data',
//             limit: 'perPage',
//             page: 'currentPage',
//             meta: 'pagination',
//         },
//     };

//     const myAggregate = model.aggregate(query);
//     const { data, pagination } = await model.aggregatePaginate(myAggregate, options);

//     delete pagination?.pagingCounter;

//     return { data, pagination };
// }


interface AccessTokenEnvVars {
    ACCESS_TOKEN_EXPIRATION: string;
    ACCESS_TOKEN_SECRET: string;
}

// generate access token
export const generateAccessToken = (user: Record<string, any>): string => {
    const { ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_SECRET }: AccessTokenEnvVars = process.env as any;

    const token = jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });

    return token;
};