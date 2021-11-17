import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {PassportStrategy} from '@nestjs/passport'
import {Profile, Strategy} from 'passport-facebook'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(private authService: AuthService, private configSerice: ConfigService){
        super({
            clientID: configSerice.get('FACEBOOK_CLIENT_ID'),
            clientSecret: configSerice.get('FACEBOOK_CLIENT_SECRET'),
            callbackURL: "/api/v1/auth/facebook/redirect",
            proxy: true,
            scope: ['email']
        })
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: (error: any, user?: any, info?: any) => void): Promise<void>{
        const user = await this.authService.loginWithFacebook(profile)
        if(!user){
            throw new UnauthorizedException()
        }
        done(null, user)
    }
}