import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './tokenPayload.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private usersService: UsersService, 
    private configService: ConfigService
    ) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null
        if(req && req.cookies){
          token = req.cookies['refresh']
        }
        return token
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    const refreshToken = req.cookies?.['refresh']
    const user = await this.usersService.getUserIfRefreshTokenMatches(refreshToken, payload.sub)
    return user
  }
}