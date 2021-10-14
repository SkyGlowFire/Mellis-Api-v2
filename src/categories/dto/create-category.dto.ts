import { ObjectId } from "mongoose"
import { IsNotEmpty, Matches, Length, IsOptional } from 'class-validator'

export class CreateCategoryDto{
    @IsNotEmpty()
    @Length(2, 60)
    title: string

    @IsOptional()
    @Matches(/^([\w ]{15, 700})?$/i)
    text: string | null

    @IsOptional()
    parentId: null | ObjectId
}