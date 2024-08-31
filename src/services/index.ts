import BaseModel from "./common/BaseModel";
import { UserDocument, UserSchema } from "./schema/user.schema";

export const UserService = new BaseModel<UserDocument>("User", UserSchema);