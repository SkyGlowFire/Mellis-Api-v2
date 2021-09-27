import { IsNotEmpty, Min, Matches, Length, IsInt} from "class-validator"

export class UpdateAddressDto{
    @IsNotEmpty()
    @Min(2)
    firstName: string

    @IsNotEmpty()
    @Min(2)
    lastName: string

    @IsNotEmpty()
    @Matches(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/, 
    {message: 'Please provide valid phone number'})
    phone: number

    @IsNotEmpty()
    city: string

    @IsNotEmpty()
    streetName: string

    @IsNotEmpty()
    streetNumber: number

    @IsNotEmpty()
    apartment: number

    @IsNotEmpty()
    @IsInt()
    @Length(6)
    zip: number
}