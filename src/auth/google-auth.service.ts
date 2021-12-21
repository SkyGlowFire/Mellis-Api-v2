import { ConfigService } from '@nestjs/config';
import {Injectable } from '@nestjs/common'
import {UsersService} from 'src/users/users.service'
import {Auth, google} from 'googleapis'
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class GoogleAutService{
    private oauthClient: Auth.OAuth2Client
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ){
        const clientId = this.configService.get('GOOGLE_CLIENT_ID')
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET')
        this.oauthClient = new google.auth.OAuth2({
            clientId, clientSecret
        })
    }

    async authenticate(token: string): Promise<UserDocument>{
        const tokenInfo = await this.oauthClient.getTokenInfo(token)
        console.log('token', token)
        console.log('tokenInfo', tokenInfo)
        const {sub, email} = tokenInfo
        let user = await this.usersService.getByGoogleId(sub)
        if(user) return user
        user = await this.usersService.getByEmail(email)
        if(user){
            user.googleId = sub
            await user.save()
        } else {
            user = await this.registerUser(token)
        }
        console.log('user', user)
        return user
    }

    private async registerUser(token: string) {
        const userData = await this.getUserData(token);
        console.log(userData)
        const user = await this.userModel.create({
            username: userData.name,
            firstName: userData.given_name,
            lastName: userData.family_name,
            email: userData.email,
            thumbnail: userData.picture,
            googleId: userData.id
        })
        
        return user
    }

    private async getUserData(token: string) {
        const userInfoClient = google.oauth2('v2').userinfo;
        
        this.oauthClient.setCredentials({
            access_token: token
        })
        
        const userInfoResponse = await userInfoClient.get({
            auth: this.oauthClient
        });
        
        return userInfoResponse.data;
    }
}