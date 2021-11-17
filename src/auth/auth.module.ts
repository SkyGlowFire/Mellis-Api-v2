import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import {PassportModule} from '@nestjs/passport'
import {LocalStrategy} from './local.strategy'
import {GoogleStrategy} from './google.strategy'
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { CaslModule } from 'src/casl/casl.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { FacebookStrategy } from './facebook.strategy';
import { VkStrategy } from './vk.strategy';
import { JwtRefreshTokenStrategy } from './jwt-refresh.strategy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy, GoogleStrategy, FacebookStrategy, VkStrategy],
  imports: [
    UsersModule, 
    PassportModule, 
    CaslModule,
    EmailModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {expiresIn: configService.get('JWT_EXPIRE')}
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema}])
  ],
  controllers: [AuthController]
})
export class AuthModule  {}
