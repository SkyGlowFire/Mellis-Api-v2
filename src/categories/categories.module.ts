import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import {Product, ProductSchema} from 'src/products/schemas/product.schema'
import { ProductsModule } from 'src/products/products.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  providers: [
    CategoriesService, 
    ],
  controllers: [CategoriesController],
  imports: [
    MongooseModule.forFeature([{
      name: Category.name,
      schema: CategorySchema},
    {
      name: Product.name,
      schema: ProductSchema}]),
      forwardRef(() => ProductsModule),
      CaslModule
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
