import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
    imports: [MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema}])],
    providers: [CaslAbilityFactory],
    exports: [CaslAbilityFactory]
})
export class CaslModule {}
