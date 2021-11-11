import { Controller, Get, Param, Query, Post, Req, Res, UseGuards, Body, Put } from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';
import { GetUser } from 'src/users/user.decorator';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './authenticated.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswDto } from './dto/forgot_passw.dto';
import { ResetPasswDto } from './dto/reset_passw.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService, 
        private usersService: UsersService,
        private configService: ConfigService
        ){}

    @Public()
    @Post('/login-local')
    @UseGuards(LocalAuthGuard)
    login(@GetUser('id') user: Types.ObjectId){
        return this.authService.login(user)
    }

    @UseGuards(AuthenticatedGuard)
    @Get('/me')
    getMe(@GetUser('id') userId: Types.ObjectId){
        return this.usersService.get(userId)
    }

    @UseGuards(AuthenticatedGuard)
    @Get('/logout')
    logout(@Req() req: Request ){
        return req.logOut()
    }

    @Get('login-google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req) {}

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Query('state') state: string, @Res() res) {
        const parsedState = new URLSearchParams(state)
        const from = parsedState.get('from') || 'profile/info'
        return res.redirect(`${this.configService.get('CLIENT_URI')}${from}`)
    }

    @Public()
    @Post('/resetPasword')
    forgotPassword(@Body() dto: ForgotPasswDto){
        return this.authService.forgotPassword(dto.email)
    }

    @Public()
    @Put('/resetPasword/:token')
    resetPassword(@Body() dto: ResetPasswDto, @Param('token') token: string ){
        return this.authService.resetPassword(token, dto.password)
    }
}