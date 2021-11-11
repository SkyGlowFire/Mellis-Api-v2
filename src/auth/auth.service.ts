import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-google-oauth20';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto'
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, 
        private jwtService: JwtService,
        private emailService: EmailService,
        @InjectModel(User.name) private userModel: Model<UserDocument>){}

    async validateUser(email: string, pas: string): Promise<UserDocument>{
        const user = await this.usersService.getByEmail(email);
        if(!user) throw new HttpException('User does not exist', HttpStatus.NOT_FOUND)
        const passwMatch = await bcrypt.compare(pas, user.password)
        if(!passwMatch) throw new HttpException('Wrong password', HttpStatus.NOT_FOUND)
        return user
    }

    async loginWithGoogle(profile: Profile): Promise<UserDocument>{
        let user = await this.usersService.getByGoogleId(profile.id)
        if(user) return user
        user = await this.usersService.getByEmail(profile.emails[0].value.toLowerCase())
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
        return user
    }

    async login(userId: Types.ObjectId): Promise<{access_token: string}>{
        
        if(!userId) {
            throw new UnauthorizedException()
        }
        const payload = {sub: userId}
        return {
            access_token: this.jwtService.sign(payload)
        }
    }

    async forgotPassword(email: string){
        const user = await this.usersService.getByEmail(email)
        if(!user) throw new NotFoundException('User with this email does not exist')
        const token = crypto.randomBytes(20).toString('hex')
        const resetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const tokenExpire = Date.now() + 20*60*1000
        user.resetPasswordExpire = tokenExpire
        user.resetPasswordToken = resetToken
        await user.save()
        try {
            await this.emailService.sendPasswordChangeEmail(email, token)
            return {success: true, msg: `Email has been sent to ${email}`}
        } catch (error) {
            user.resetPasswordExpire = undefined
            user.resetPasswordToken = undefined
            await user.save()
            throw error
        }
    }

    async resetPassword(token: string, password: string){
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await this.userModel.findOne({
            resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}
        })
        if(!user) throw new BadRequestException('Token has been expired')
        user.password = password
        user.resetPasswordExpire = undefined
        user.resetPasswordToken = undefined
        await user.save()
    }
}
