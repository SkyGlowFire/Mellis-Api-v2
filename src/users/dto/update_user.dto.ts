import { IsEmail, IsNotEmpty, IsInt, MinLength, IsOptional, Matches, ValidateIf} from "class-validator"

export class UpdateUserDto{
    @IsEmail()
    email: string

    @MinLength(4)
    username: string

    @Matches(/^([\w А-Яа-яЁё]{2,30})?$/i, {message: 'First Name must be between 2 and 30 characters, and can contain only letters and spaces'})
    firstName: string

    @Matches(/^([\w А-Яа-яЁё]{2,30})?$/i, {message: 'Last Name must be between 2 and 30 characters, and can contain only letters and spaces'})
    lastName: string

    @Matches(/^(((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10})?$/i, {message: 'Enter valid phone number'})
    phone: string

    @Matches(/^((?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15})?$/, {message: 'Password must contain at least one character and one number, and must be between 8 and 15 characters length'})
    password: string;

    // @ValidateIf(o => Boolean(o.password))
    // @IsNotEmpty()
    oldPassword: string;
}