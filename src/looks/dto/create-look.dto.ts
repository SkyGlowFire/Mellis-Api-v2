import { ObjectId } from "mongoose"
import { Orientation } from "../schemas/look.schema"
import { IsBoolean, IsNotEmpty, Matches, IsMongoId, ArrayNotEmpty } from 'class-validator'

export class CreateLookDto{
    @IsNotEmpty()
    @IsBoolean()
    enable: boolean

    @IsNotEmpty()
    @Matches(/(vertical | horizontal)/i)
    orientation: Orientation

    @IsNotEmpty()
    @ArrayNotEmpty()
    @IsMongoId({each: true})
    items: ObjectId[]
}