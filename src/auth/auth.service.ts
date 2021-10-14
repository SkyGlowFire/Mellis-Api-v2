import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { Model, ObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-google-oauth20';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, 
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<UserDocument>){}

    async validateUser(email: string, pas: string): Promise<UserDocument>{
        const user = await this.usersService.getByEmail(email);
        if(!user) throw new HttpException('User does not exist', HttpStatus.NOT_FOUND)
        const passwMatch = await bcrypt.compare(pas, user.password)
        if(!passwMatch) throw new HttpException('Wrong password', HttpStatus.NOT_FOUND)
        return user
    }

     async loginWithGoogle(profile: Profile): Promise<ObjectId>{
        let user = await this.usersService.getByGoogleId(profile.id)
        if(!user) {
            user = await this.usersService.getByEmail(profile.emails[0].value.toLowerCase())
        }

        if(!user){
            user = await this.userModel.create({
                username: profile.displayName,
                email: profile.emails[0].value.toLowerCase(),
                googleId: profile.id,
                thumbnail: profile.photos[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName
            })
        } else {
            user.googleId = profile.id;
            await user.save()
        }
        return user.id
    }

    async login(userId: ObjectId): Promise<{access_token: string}>{
        
        if(!userId) {
            throw new UnauthorizedException()
        }
        const payload = {sub: userId}
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
