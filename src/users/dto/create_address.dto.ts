import { IsNotEmpty, Min, Matches, Length, IsInt, MinLength, IsOptional} from "class-validator"

export class CreateAddressDto{
    @IsNotEmpty()
    @MinLength(2)
    firstName: string

    @IsNotEmpty()
    @MinLength(2)
    lastName: string

    @IsOptional()
    @Matches(/^(((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10})?$/, 
    {message: 'Please provide valid phone number'})
    phone: number

    @IsNotEmpty()
    @MinLength(2)
    city: string

    @IsNotEmpty()
    @MinLength(3)
    streetName: string

    @IsNotEmpty()
    streetNumber: number

    @IsNotEmpty()
    apartment: number

    @IsNotEmpty()
    @Length(6)
    zip: number
}