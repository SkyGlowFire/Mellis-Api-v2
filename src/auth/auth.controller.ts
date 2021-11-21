import { Controller, Get, Param, Post,  Res, UseGuards, Body, Put } from '@nestjs/common';
import {Response } from 'express';
import { Types } from 'mongoose';
import { GetUser } from 'src/users/user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { ForgotPasswDto } from './dto/forgot_passw.dto';
import { ResetPasswDto } from './dto/reset_passw.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { GoogleAutService } from './google-auth.service';
import SocialLoginDto from './dto/social-login.dto';
import { VkAutService } from './vk-auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService, 
        private googleAuthService: GoogleAutService,
        private vkAuthService: VkAutService,
        ){}

    @Public()
    @Post('/login-local')
    @UseGuards(LocalAuthGuard)
    login(@GetUser() user: UserDocument, @Res({passthrough: true}) res: Response){
        return this.authService.login(user, res)
    }

    @Public()
    @Post('/signup')
    async createUser(@Body() dto: CreateUserDto, @Res({passthrough: true}) res){
        const user = await  this.authService.signup(dto)
        return this.authService.login(user, res)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/me')
    getMe(@GetUser() user: UserDocument){
        return user
    }

    @UseGuards(JwtRefreshGuard)
    @Get('/refresh')
    refresh(@GetUser() user: UserDocument, @Res() res){
        const accessToken = this.authService.getJwtAccessToken(user._id)
        const cookieOptions = this.authService.getAccessCookieOptions()
        return res.cookie('Authentication', accessToken, cookieOptions).json({success: true})
    }

    @UseGuards(JwtAuthGuard)
    @Get('/logout')
    logout(@Res({passthrough: true}) res, @GetUser('_id') userId: Types.ObjectId ){
        return this.authService.logout(res, userId)
    }

    @Post('login-google')
    async googleAuth(@Body() dto: SocialLoginDto, @Res({passthrough: true}) res) {
        const user = await this.googleAuthService.authenticate(dto.token)
        return this.authService.login(user, res)
    }

    @Post('login-vkontakte')
    async vkAuth(@Body() dto: SocialLoginDto, @Res({passthrough: true}) res) {
        const user = await this.vkAuthService.authenticate(dto.token)
        return this.authService.login(user, res)
    }

    @Public()
    @Post('/resetPasword')
    sendResetEmail(@Body() dto: ForgotPasswDto){
        return this.authService.sendResetEmail(dto.email)
    }

    @Public()
    @Put('/resetPasword/:token')
    resetPassword(@Body() dto: ResetPasswDto, @Param('token') token: string, @Res({passthrough: true}) res ){
        return this.authService.resetPassword(token, dto.password, res)
    }
}