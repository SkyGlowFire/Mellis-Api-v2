import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {PassportStrategy} from '@nestjs/passport'
import {Profile, Strategy, VerifyCallback} from 'passport-google-oauth20'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/google/redirect",
            proxy: true,
            scope: ['email', 'profile'],
            // passReqToCallback: true,
        })
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void>{
        const user = await this.authService.loginWithGoogle(profile)
        if(!user){
            throw new UnauthorizedException()
        }
        done(null, user)
    }
}