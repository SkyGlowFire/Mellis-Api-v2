import * as mongoose from "mongoose"
import { Size } from "../schemas/product.schema"
import { ArrayNotEmpty, IsOptional, IsBoolean, IsDefined, IsMongoId, IsNotEmpty, IsNumber, IsArray, IsPositive, IsString, Length, Matches, Min, ValidateIf } from "class-validator";

export class UpdateProductDto{
    @IsNotEmpty()
    @IsString()
    @Length(4, 80)
    title?: string

    @IsDefined()
    // @IsBoolean()
    enable?: boolean

    @IsOptional()
    @IsString()
    @Matches(/^(|.{10,500})$/i)
    description?: string

    @IsNotEmpty()
    @IsString()
    brand: string

    @IsNotEmpty()
    @IsMongoId()
    category?: mongoose.Types.ObjectId

    @IsNotEmpty()
    @IsString()
    color?: string

    // @IsPositive()
    @IsDefined()
    price?: number

    @IsDefined()
    // @IsPositive()
    weight?: number

    @IsOptional()
    @IsString()
    sku?: string

    @IsOptional()
    @Matches(/xs|s|m|l|xl|xxl/i, {each: true})
    sizes?: Size[]

    // @IsBoolean()
    @IsDefined()
    bulkDiscountEnable?: boolean

    @ValidateIf(o => o.bulkDiscountEnable === true)
    @IsPositive()
    @Min(2)
    bulkDiscountQty?: number

    @ValidateIf(o => o.bulkDiscountEnable === true)
    @IsPositive()
    @Min(1)
    bulkDiscountPrice?: number

    @IsOptional()
    // @IsArray()
    // @IsString({each: true})
    mediaToRemove: mongoose.Types.ObjectId[]
}