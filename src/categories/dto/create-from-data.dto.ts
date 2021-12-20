import { IsNotEmpty, Matches, Length, IsOptional, IsArray } from 'class-validator'

export class CategoryData{
    @IsNotEmpty()
    @Length(2, 60)
    title: string

    @IsOptional()
    @Matches(/^([\w .,'\/-]{15,700})?$/i)
    text?: string | null

    @IsArray()
    children: CategoryData[] | string[]
}

export class CategoryDataDto{
    data: CategoryData[]
}