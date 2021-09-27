import { IsEmail, IsNotEmpty, Min, Matches } from "class-validator"

export class CreateUserDto{
    @IsNotEmpty()
    @Min(3)
    username: string

    @IsEmail()
    email: string

    @IsNotEmpty()
    @Min(6)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]*$/, {message: 'Password must contain at least one character and one number'})
    password: string
}