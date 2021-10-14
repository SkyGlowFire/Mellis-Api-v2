import { Orientation } from "../schemas/look.schema"
import { Matches, ArrayNotEmpty, IsDefined, IsString } from 'class-validator'
import * as mongoose from 'mongoose'

export class UpdateLookDto{
    @IsDefined()
    enable: boolean

    @IsDefined()
    @Matches(/vertical|horizontal/i)
    orientation: Orientation

    @ArrayNotEmpty()
    @IsString({each: true})
    items: mongoose.Types.ObjectId[]
}