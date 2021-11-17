import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import {Profile as FacebookProfile} from 'passport-facebook'
import {Profile as VkProfile} from 'passport-vkontakte'
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto'
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { Response, CookieOptions } from 'express';
import { CreateUserDto } from './dto/create_user.dto';
import { TokenPayload } from './tokenPayload.interface';
import * as ms from 'ms'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, 
        private jwtService: JwtService,
        private emailService: EmailService,
        private configService: ConfigService,
        @InjectModel(User.name) private userModel: Model<UserDocument>){}

    async validateUser(email: string, pas: string): Promise<UserDocument>{
        const user = await this.usersService.getByEmail(email);
        if(!user) throw new HttpException('User does not exist', HttpStatus.NOT_FOUND)
        const passwMatch = await bcrypt.compare(pas, user.password)
        if(!passwMatch) throw new HttpException('Wrong password', HttpStatus.FORBIDDEN)
        return user
    }

    async loginWithGoogle(profile: GoogleProfile): Promise<UserDocument>{
        let user = await this.usersService.getByGoogleId(profile.id)
        if(user) return user
        if(profile.emails?.[0]){
            user = await this.usersService.getByEmail(profile.emails[0].value.toLowerCase())
        }
        if(!user){
            user = await this.userModel.create({
                username: profile.displayName,
                email: profile.emails?.[0]?.value?.toLowerCase(),
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

    async loginWithVk(profile: VkProfile): Promise<UserDocument>{
        let user = await this.usersService.getByVkId(profile.id)
        if(user) return user
        if(profile.emails?.[0]){
            user = await this.usersService.getByEmail(profile.emails[0].value.toLowerCase())
        }
        if(!user){
            user = await this.userModel.create({
                username: profile.displayName,
                email: profile.emails?.[0]?.value?.toLowerCase(),
                vkontakteId: profile.id,
                thumbnail: profile.photos[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName
            })
        } else {
            user.vkontakteId = profile.id;
            await user.save()
        }
        return user
    }

    async loginWithFacebook(profile: FacebookProfile): Promise<UserDocument>{
        let user = await this.usersService.getByFacebokId(profile.id)
        if(user) return user
        if(profile.emails?.[0]){
            user = await this.usersService.getByEmail(profile.emails[0].value.toLowerCase())
        }
        if(!user){
            user = await this.userModel.create({
                username: profile.displayName,
                email: profile.emails?.[0]?.value?.toLowerCase(),
                facebookId: profile.id,
                thumbnail: profile.photos?.[0]?.value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName
            })
        } else {
            user.facebookId = profile.id;
            await user.save()
        }
        return user
    }

    getJwtAccessToken(userId: Types.ObjectId): string{
        const payload: TokenPayload = {sub: userId}
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
        })
        return token
    }

    getAccessCookieOptions(): CookieOptions{
        return {
            expires: new Date( Date.now() + ms(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'))),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };
    }

    getJwtRefreshToken(userId: Types.ObjectId): string{
        const payload: TokenPayload = {sub: userId}
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')
        })
        return token
    }

    getRefreshCookieOptions(): CookieOptions{
        return {
            expires: new Date( Date.now() + ms(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'))),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };
    }

    async login(userId: Types.ObjectId, res: Response, from?: string){
        if(!userId) throw new UnauthorizedException()
        const refreshToken = this.getJwtRefreshToken(userId)
        const accessToken = this.getJwtAccessToken(userId)
        const refreshCookieOptions = this.getRefreshCookieOptions()
        const accessCookieOptions = this.getAccessCookieOptions()
        await this.usersService.setRefreshToken(refreshToken, userId)
        res
        .cookie('auth', accessToken, accessCookieOptions)
        .cookie('refresh', refreshToken, refreshCookieOptions)

        if(from){
            res.redirect(`${this.configService.get('CLIENT_URI')}${from}`)
        } else {
            res.json({success: true})
        }
    }

    async logout(res: Response, userId: Types.ObjectId){
        await this.usersService.removeRefreshToken(userId)
        res.cookie('auth', undefined, {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        }).cookie('refresh', undefined, {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        })
        return { success: true }
    }

    async signup(dto: CreateUserDto, res: Response, from?: string){
        const existingUser = await this.usersService.getByEmail(dto.email)
        if(existingUser){
            throw new ForbiddenException(`User with email ${dto.email} already exists`)
        }
        const user = await this.userModel.create(dto)
        return this.login(user._id, res, from)
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

    async resetPassword(token: string, password: string, res: Response){
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
        await this.login(user._id, res)
    }
}
