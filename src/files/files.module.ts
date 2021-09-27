import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FileSchema, File } from './schemas/file.schema';

@Module({
  providers: [FilesService],
  exports: [FilesService],
  imports: [ MongooseModule.forFeature([{
      name: File.name,
      schema: FileSchema}])]
})
export class FilesModule {}
