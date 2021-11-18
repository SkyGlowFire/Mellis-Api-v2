import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
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

    async login(user: UserDocument, res: Response): Promise<UserDocument>{
        console.log('login')
        if(!user) throw new UnauthorizedException()
        console.log('userid', user._id)
        const refreshToken = this.getJwtRefreshToken(user._id)
        const accessToken = this.getJwtAccessToken(user._id)
        const refreshCookieOptions = this.getRefreshCookieOptions()
        const accessCookieOptions = this.getAccessCookieOptions()
        await this.usersService.setRefreshToken(refreshToken, user._id)
        console.log(refreshToken)
        console.log(accessToken)
        res
        .cookie('Authentication', accessToken, accessCookieOptions)
        .cookie('Refresh', refreshToken, refreshCookieOptions)
        return user
    }

    async logout(res: Response, userId: Types.ObjectId){
        await this.usersService.removeRefreshToken(userId)
        res.cookie('Authentication', undefined, {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        }).cookie('Refresh', undefined, {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        })
        return { success: true }
    }

    async signup(dto: CreateUserDto): Promise<UserDocument>{
        const existingUser = await this.usersService.getByEmail(dto.email)
        if(existingUser){
            throw new ForbiddenException(`User with email ${dto.email} already exists`)
        }
        const user = await this.userModel.create(dto)
        return user
    }

    async sendResetEmail(email: string){
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
