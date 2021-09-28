import { Module } from '@nestjs/common';
import { LooksService } from './looks.service';
import { LooksController } from './looks.controller';
import { FilesModule } from 'src/files/files.module';
import { Look, LookSchema } from './schemas/look.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/casl/casl.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [LooksService],
  controllers: [LooksController],
  imports: [
    FilesModule, 
    CaslModule,
    MongooseModule.forFeature([{
      name: Look.name,
      schema: LookSchema}])]
})
export class LooksModule {}
