import { ObjectId } from "mongoose"
import { IsNotEmpty, Length, Min } from 'class-validator'

export class CreateCategoryDto{
    @IsNotEmpty()
    @Length(2, 60)
    title: string

    @Length(12, 600)
    text: string | null
    parentId: null | ObjectId
}