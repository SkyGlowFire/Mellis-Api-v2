import { ObjectId } from "mongoose"
import { Orientation } from "../schemas/look.schema"
import { IsBoolean, IsNotEmpty, Matches, IsMongoId, ArrayNotEmpty, IsString, IsDefined } from 'class-validator'
import * as mongoose from 'mongoose'

export class CreateLookDto{
    @IsDefined()
    enable: boolean

    @IsDefined()
    @Matches(/vertical|horizontal/i)
    orientation: Orientation

    @ArrayNotEmpty()
    @IsString({each: true})
    items: mongoose.Types.ObjectId[]
}