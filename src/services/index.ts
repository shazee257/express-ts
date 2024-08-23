import BaseModel from "./common/BaseModel";
import { UserSchema } from "./schema/user.schema";

export const UserService = new BaseModel("User", UserSchema);