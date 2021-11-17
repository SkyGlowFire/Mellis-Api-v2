import { UserDocument } from "src/users/schemas/user.schema";
import {Request} from 'express'

export interface ReqWithUser extends Request{
    user: UserDocument
}