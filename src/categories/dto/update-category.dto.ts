import { IsNotEmpty, Length, IsOptional, Matches } from 'class-validator'

export class UpdateCategoryDto{
    @IsOptional()
    @IsNotEmpty()
    @Length(2, 60)
    title?: string

    @IsOptional()
    @Matches(/^([\w ]{15, 700})?$/i)
    text?: string | null
}