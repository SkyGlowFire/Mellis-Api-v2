import { IsEmail, IsNotEmpty, Min, Matches, MinLength, IsString, Length } from "class-validator"

export class CreateUserDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username: string

    @IsEmail()
    email: string

    @IsNotEmpty()
    @Length(6, 50)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]*$/, {message: 'Password must contain at least one character and one number'})
    password: string
}