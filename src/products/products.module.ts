import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesModule } from 'src/categories/categories.module';
import { FilesModule } from 'src/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  providers: [ProductsService],
  controllers: [ProductsController],
  imports: [
    CategoriesModule, 
    FilesModule, 
    MongooseModule.forFeature([{
      name: Product.name,
      schema: ProductSchema}])],
  exports: [ProductsService]
})
export class ProductsModule {}
