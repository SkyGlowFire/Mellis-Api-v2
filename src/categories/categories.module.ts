import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategoryDocument, CategorySchema } from './schemas/category.schema';
import { ProductsModule } from 'src/products/products.module';
import { CaslModule } from 'src/casl/casl.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [
    CategoriesService, 
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }],
  controllers: [CategoriesController],
  imports: [
    MongooseModule.forFeature([{
      name: Category.name,
      schema: CategorySchema}]),
      forwardRef(() => ProductsModule),
      CaslModule
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
