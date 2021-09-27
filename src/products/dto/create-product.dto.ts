
import { ObjectId } from "mongoose"
import { Sizes } from "../schemas/product.schema"
import { ArrayNotEmpty, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Matches, Min } from "class-validator";

export class CreateProductDto{
    @IsNotEmpty()
    @IsString()
    @Length(4, 80)
    title: string

    @IsNotEmpty()
    @IsBoolean()
    enable: boolean

    @IsNotEmpty()
    @IsString()
    @Length(12, 600)
    description: string

    @IsNotEmpty()
    @IsMongoId()
    category: ObjectId

    @IsNotEmpty()
    @IsString()
    color: string

    @IsNotEmpty()
    @IsPositive()
    weight: number

    @IsString()
    sku?: string

    @IsNotEmpty()
    @IsPositive()
    price: number

    @Matches(/xs|sm|md|lg|xl|xxl/i, {each: true})
    sizes?: Sizes[]

    @IsBoolean()
    bulkDiscountEnable?: boolean

    @IsPositive()
    @Min(2)
    bulkDiscountQty?: number

    @IsPositive()
    @Min(1)
    bulkDiscountPrice?: number
}