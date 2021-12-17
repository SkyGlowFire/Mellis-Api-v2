
import * as mongoose from "mongoose"
import { Size } from "../schemas/product.schema"
import { IsBoolean, IsDefined, IsMongoId, IsNotEmpty,  IsOptional,  IsPositive, IsString, Length, Matches, Min, ValidateIf } from "class-validator";

export class CreateProductDto{
    @IsNotEmpty()
    @IsString()
    @Length(4, 80)
    title: string

    @IsDefined()
    // @IsBoolean()
    enable: boolean

    @IsOptional()
    @IsString()
    @Matches(/^(|.{10,500})$/i)
    description: string

    @IsNotEmpty()
    @IsString()
    brand: string

    @IsNotEmpty()
    @IsMongoId()
    category: mongoose.Types.ObjectId

    @IsNotEmpty()
    @IsString()
    color: string

    @IsDefined()
    // @IsPositive()
    weight: number

    @IsOptional()
    @IsString()
    sku?: string

    @IsDefined()
    // @IsPositive()
    price: number

    @IsOptional()
    @Matches(/xs|s|m|l|xl|xxl/i, {each: true})
    sizes?: Size[]

    @IsDefined()
    // @IsBoolean()
    bulkDiscountEnable: boolean

    @ValidateIf(o => o.bulkDiscountEnable === true)
    @IsPositive()
    @Min(2)
    bulkDiscountQty?: number

    @ValidateIf(o => o.bulkDiscountEnable === true)
    @IsPositive()
    @Min(1)
    bulkDiscountPrice?: number
}