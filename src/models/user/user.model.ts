import { Schema, model, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { IPaginationResult, IUser } from "../../utils/interfaces";
import { ROLES } from "../../utils/constants";
import { getMongoosePaginatedData } from "../../utils/helpers";

const userSchema = new Schema<IUser>({
    name: { type: String },
    email: { type: String, lowercase: true },
    password: { type: String, require: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: "user" },
    fcmToken: { type: String, require: true, select: false },
}, { timestamps: true, versionKey: false });

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = model("User", userSchema);

// create new user
export const createUser = (obj: Record<string, any>)
    : Promise<IUser> => UserModel.create(obj);

// find user by query
export const findUser = (query: Record<string, any>)
    : any => UserModel.findOne(query);

// get all users
export const getAllUsers = async ({ query, page, limit, populate }:
    { query?: Record<string, any>, page?: number, limit?: number, populate?: string | any[] })
    : Promise<IPaginationResult<IUser>> => {
    const { data, pagination }: IPaginationResult<IUser> = await getMongoosePaginatedData({
        model: UserModel, query, page, limit, populate
    });

    return { data, pagination };
};