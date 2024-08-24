import { Schema, Document } from "mongoose";
import { ROLES } from "../../utils/constants";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export interface IUser extends Document {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    fcmToken?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const UserSchema = new Schema<IUser>({
    name: { type: String },
    email: { type: String, lowercase: true },
    password: { type: String, require: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: "user" },
    fcmToken: { type: String, require: true, select: false },
}, { timestamps: true, versionKey: false });

// UserSchema.index({ email: 1 }, { unique: true });

// hash password before saving
UserSchema.pre<IUser>("save", async function (next: any) {
    if (!this.isModified("password")) return next();
    this.password = await hash(this.password as string, 10);
    next();
});

UserSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function (): string {
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

UserSchema.methods.generateRefreshToken = function (): string {
    return sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};