import { IsNotEmpty, Length, Min } from 'class-validator'

export class UpdateCategoryDto{
    @IsNotEmpty()
    @Length(2, 60)
    title?: string

    @Length(12, 600)
    text?: string | null
}