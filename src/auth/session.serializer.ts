import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {PassportSerializer} from '@nestjs/passport'
import { Model, ObjectId } from "mongoose";
import { User, UserDocument } from "src/users/schemas/user.schema";

@Injectable()
export class SessionSerializer extends PassportSerializer{
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){
        super()
    }

    serializeUser(user: UserDocument, done: (err:Error, user: any) => void): void{
        done(null, user.id)
    }

    async deserializeUser(id: ObjectId, done: (err:Error, user: any) => void) : Promise<void>{
        const user = await this.userModel.findById(id)
        done(null, user)
    }
}