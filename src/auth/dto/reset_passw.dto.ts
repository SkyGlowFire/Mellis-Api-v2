import { IsNotEmpty } from "class-validator"

export class ResetPasswDto{
    @IsNotEmpty()
    password: string
}