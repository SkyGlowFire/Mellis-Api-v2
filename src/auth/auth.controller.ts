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

    @UseGuards(JwtAuthGuard)
    @Get('/me')
    getMe(@GetUser('id') userId: Types.ObjectId){
        return this.usersService.get(userId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/logout')
    logout(@Res() res ){
        return res.status(200).cookie('auth', undefined, {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        })
        .json({ success: true });
    }

    @Get('login-google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req) {}

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Query('state') state: string, @Res() res, @GetUser('id') user: Types.ObjectId) {
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