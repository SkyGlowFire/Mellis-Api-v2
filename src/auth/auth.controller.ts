import { Controller, Get, Param, Query, Post, Req, Res, UseGuards, Body, Put } from '@nestjs/common';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { GetUser } from 'src/users/user.decorator';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { ForgotPasswDto } from './dto/forgot_passw.dto';
import { ResetPasswDto } from './dto/reset_passw.dto';
import { FacebookAuthGuard } from './facebook-auth.guard';
import { VkAuthGuard } from './vk-auth.guard';
import { CreateUserDto } from './dto/create_user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService, 
        private usersService: UsersService,
        ){}

    @Public()
    @Post('/login-local')
    @UseGuards(LocalAuthGuard)
    login(@GetUser('id') user: Types.ObjectId, @Res() res: Response){
        return this.authService.login(user, res)
    }

    @Public()
    @Post('/signup')
    createUser(@Body() dto: CreateUserDto, @Res() res, @Query('from') from: string){
        return this.authService.signup(dto, res, from)
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
        return res.cookie('auth', accessToken, cookieOptions).json({success: true})
    }

    @UseGuards(JwtAuthGuard)
    @Get('/logout')
    logout(@Res({passthrough: true}) res, @GetUser('_id') userId: Types.ObjectId ){
        return this.authService.logout(res, userId)
    }

    @Get('login-google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req) {}

    @Get('login-facebook')
    @UseGuards(FacebookAuthGuard)
    async facebookAuth(@Req() req) {}

    @Get('login-vkontakte')
    @UseGuards(VkAuthGuard)
    async vkAuth(@Req() req) {}

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Query('state') state: string, @Res() res, @GetUser('id') user: Types.ObjectId) {
        const parsedState = new URLSearchParams(state)
        const from = parsedState.get('from') || 'profile/info'
        return this.authService.login(user, res, from)
    }

    @Get('facebook/redirect')
    @UseGuards(FacebookAuthGuard)
    facebookAuthRedirect(@Query('state') state: string, @Res() res, @GetUser('id') user: Types.ObjectId) {
        const parsedState = new URLSearchParams(state)
        const from = parsedState.get('from') || 'profile/info'
        return this.authService.login(user, res, from)
    }

    @Get('vk/redirect')
    @UseGuards(VkAuthGuard)
    vkAuthRedirect(@Query('state') state: string, @Res() res, @GetUser('id') user: Types.ObjectId) {
        const parsedState = new URLSearchParams(state)
        const from = parsedState.get('from') || 'profile/info'
        return this.authService.login(user, res, from)
    }

    @Public()
    @Post('/resetPasword')
    forgotPassword(@Body() dto: ForgotPasswDto){
        return this.authService.forgotPassword(dto.email)
    }

    @Public()
    @Put('/resetPasword/:token')
    resetPassword(@Body() dto: ResetPasswDto, @Param('token') token: string, @Res({passthrough: true}) res ){
        return this.authService.resetPassword(token, dto.password, res)
    }
}