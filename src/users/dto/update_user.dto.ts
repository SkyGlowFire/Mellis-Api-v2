import { IsEmail, IsNotEmpty, IsInt} from "class-validator"

export class UpdateUserDto{
    @IsEmail()
    email?: string

    username?: string
    password?: string
    
    @IsInt()
    age?: number
}