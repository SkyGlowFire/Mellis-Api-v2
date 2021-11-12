import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {PassportStrategy} from '@nestjs/passport'
import {Strategy} from 'passport-local'
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){
        super({usernameField: 'email', passwordField: 'password'})
    }

    async validate(email: string, password: string): Promise<UserDocument>{
        if(!email || !password){throw new HttpException('Please provide email and password', HttpStatus.BAD_REQUEST)}
        const user = await this.authService.validateUser(email, password)
        if(!user){
            throw new UnauthorizedException()
        }
        return user
    }
}
