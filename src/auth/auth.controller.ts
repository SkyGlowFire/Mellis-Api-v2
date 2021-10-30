import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService){}

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
    googleAuthRedirect(@GetUser('id') user: Types.ObjectId) {
        return this.authService.login(user)
    }
}