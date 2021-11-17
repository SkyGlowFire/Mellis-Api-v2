import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './schemas/user.schema';
import { Address, AddressSchema} from './schemas/address.schema';
import * as bcrypt from 'bcryptjs'
import { CaslModule } from 'src/casl/casl.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [MongooseModule.forFeatureAsync([
    {
      name: User.name,
      useFactory: () => {
        const schema = UserSchema

        schema.pre<UserDocument>('save', async function(next: Function){
          if(!this.isModified('password')){
              return next()
          }
          const salt = await bcrypt.genSalt(10)
          this.password = await bcrypt.hash(this.password, salt)
          next()
        })

        schema.pre<UserDocument>('save', async function(next: Function){
          if(this.hasPassword) return next()
          if(this.isModified('password')){
              this.hasPassword = true
          }
          next()
        })

        schema.pre<UserDocument>('save', async function(next: Function){
          if(!this.isModified('email')) return next()
          this.email = this.email?.toLowerCase()
          next()
        })

        return schema
      }
    },
    {
      name: Address.name,
      useFactory: () => AddressSchema
    }
  ]),
  CaslModule,
  JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {expiresIn: configService.get('JWT_EXPIRE')}
      }),
      inject: [ConfigService]
    })
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
