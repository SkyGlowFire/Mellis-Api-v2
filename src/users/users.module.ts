import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './schemas/user.schema';
import { Address, AddressSchema} from './schemas/address.schema';

import * as bcrypt from 'bcryptjs'
import { CaslModule } from 'src/casl/casl.module';

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

        return schema
      }
    },
    {
      name: Address.name,
      useFactory: () => AddressSchema
    }
  ]),
  CaslModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
