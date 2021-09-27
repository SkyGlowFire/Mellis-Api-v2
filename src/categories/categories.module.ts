import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategoryDocument, CategorySchema } from './schemas/category.schema';
import { ProductsModule } from 'src/products/products.module';

@Module({
  providers: [CategoriesService],
  controllers: [CategoriesController],
  imports: [
    MongooseModule.forFeature([{
      name: Category.name,
      schema: CategorySchema}]),
      forwardRef(() => ProductsModule)
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
