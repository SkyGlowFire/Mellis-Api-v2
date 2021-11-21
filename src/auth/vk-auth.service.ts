import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common'
import {UsersService} from 'src/users/users.service'
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { Observable, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class VkAutService{
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
        private httpService: HttpService,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ){}

    async authenticate(code: string): Promise<UserDocument>{
        let tokenInfo
        try {
            tokenInfo = await lastValueFrom(this.getAccessToken(code))
        } catch (error) {
            throw new UnauthorizedException('Access code has been expired')
        }
        const {email, user_id, access_token} = tokenInfo
        let user = await this.usersService.getByVkId(user_id)
        if(user) return user
        if(email){
            user = await this.usersService.getByEmail(email)
        }
        if(user){
            user.vkontakteId = user_id
            await user.save()
        } else {
            user = await this.registerUser(user_id, email, access_token)
        }
        return user
    }

    private async registerUser(userId: string, email: string, token: string) {
        let res
        try {
            res = await lastValueFrom(this.getUserData(userId, token))
        } catch (error) {
            throw new UnauthorizedException('Access code has been expired')
        }
        const profile = res.response[0]
        const user = await this.userModel.create({
            username: `${profile.first_name} ${profile.last_name}`,
            firstName: profile.first_name,
            lastName: profile.last_name,
            email: email,
            thumbnail: profile.photo_400,
            vkontakteId: userId
        })
        
        return user
    }

    private getAccessToken(code: string): Observable<any>{
        const clientId = this.configService.get('VK_CLIENT_ID')
        const clientSecret = this.configService.get('VK_CLIENT_SECRET')
        const clientUrl = this.configService.get('CLIENT_URI')
        const cblink = `${clientUrl}/auth/login`
        return this.httpService
        .get(`https://oauth.vk.com/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${cblink}&code=${code}`)
        .pipe(map(res => res.data))
    }

    private getUserData(userId: string, token: string): Observable<any> {
        return this.httpService
        .get(`https://api.vk.com/method/users.get?user_ids=${userId}&access_token=${token}&v=5.120`)
        .pipe(map(res => res.data))
    }
}