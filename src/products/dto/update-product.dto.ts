import { ObjectId } from "mongoose"
import { Sizes } from "../schemas/product.schema"
import { ArrayNotEmpty, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Matches, Min } from "class-validator";

export class UpdateProductDto{
    @IsString()
    @Length(4, 80)
    title?: string

    @IsBoolean()
    enable?: boolean

    @IsString()
    @Length(12, 600)
    description?: string

    @IsMongoId()
    category?: ObjectId

    @IsString()
    color?: string

    @IsPositive()
    price?: number

    @IsPositive()
    weight?: number

    @IsString()
    sku?: string

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

    @IsMongoId({each: true})
    mediaToRemove: ObjectId[]
}