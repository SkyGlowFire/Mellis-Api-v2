import { IsEmail } from "class-validator"

export class ForgotPasswDto{
    @IsEmail()
    email: string
}