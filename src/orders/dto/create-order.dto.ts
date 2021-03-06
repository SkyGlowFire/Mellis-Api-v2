import { ArrayNotEmpty, IsMongoId, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class CreateOrderDto{
    @ValidateNested()
    @ArrayNotEmpty()
    items: OrderItem[]

    @IsNotEmpty()
    @IsNumber()
    price: number

    @IsNotEmpty()
    @IsMongoId()
    address: Types.ObjectId
}

class OrderItem{
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    size: string

    @IsNotEmpty()
    @IsString()
    color: string

    @IsNotEmpty()
    @IsNumber()
    price: number

    @IsNotEmpty()
    @IsNumber()
    qty: number

    @IsNotEmpty()
    @IsMongoId()
    product: Types.ObjectId
}