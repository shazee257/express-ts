import { Document, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { IPaginationFunctionParams, IPaginationResult } from "../../utils/interfaces";
import { ROLES } from "../../utils/constants";
import { getMongoosePaginatedData } from "../../utils/helpers";
import { compare, hash } from "bcrypt";
import { QueryWithHelpers } from "mongoose";
import { sign } from "jsonwebtoken";

export interface IUser extends Document {
    _id?: string;
    name?: string;
    email: string;
    role: string;
    password: string;
    fcmToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String },
    email: { type: String, lowercase: true },
    password: { type: String, require: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: "user" },
    fcmToken: { type: String, require: true, select: false },
}, { timestamps: true, versionKey: false });

// hash password before saving
userSchema.pre<IUser>("save", async function (next: any) {
    if (!this.isModified("password")) return next();
    this.password = await hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
    return sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function (): string {
    return sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

// mongoose pagination plugins
userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = model("User", userSchema);

// create new user
export const createUser = (obj: Record<string, any>): Promise<any> => UserModel.create(obj);

// find user by query
export const findUser = (query: Record<string, any>): QueryWithHelpers<any, Document> => UserModel.findOne(query);

// get all users
export const getAllUsers = async ({ query, page, limit, populate }: IPaginationFunctionParams)
    : Promise<IPaginationResult<IUser>> => {
    const { data, pagination }: IPaginationResult<IUser> = await getMongoosePaginatedData({
        model: UserModel, query, page, limit, populate
    });

    return { data, pagination };
};