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
import { SessionSerializer } from './session.serializer';
import { EmailModule } from 'src/email/email.module';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, SessionSerializer],
  imports: [
    UsersModule, 
    PassportModule.register({session: true}), 
    CaslModule,
    EmailModule,
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
