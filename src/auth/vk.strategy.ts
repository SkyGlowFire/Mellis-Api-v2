import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {PassportStrategy} from '@nestjs/passport'
import {Profile, Strategy, VerifyCallback, Params} from 'passport-vkontakte'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VkStrategy extends PassportStrategy(Strategy, 'vkontakte') {
    constructor(private authService: AuthService, private configSerice: ConfigService){
        super({
            clientID: configSerice.get('VK_CLIENT_ID'),
            clientSecret: configSerice.get('VK_CLIENT_SECRET'),
            callbackURL: "/api/v1/auth/vk/redirect",
            proxy: true,
            scope: ['email']
        })
    }

    async validate(_accessToken: string, _refreshToken: string, params: Params, profile: Profile, done: VerifyCallback): Promise<void>{
        const user = await this.authService.loginWithVk(profile)
        if(!user){
            throw new UnauthorizedException()
        }
        done(null, user)
    }
}