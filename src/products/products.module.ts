import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesModule } from 'src/categories/categories.module';
import { FilesModule } from 'src/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductSchema } from './schemas/product.schema';
import { CaslModule } from 'src/casl/casl.module';
import { capitalize } from 'src/utils/textFormatters';
import { OrderItem, OrderItemSchema } from 'src/orders/schemas/order-item.schema';

@Module({
  providers: [ProductsService],
  controllers: [ProductsController],
  imports: [
    forwardRef(() => CategoriesModule),
    CaslModule,
    FilesModule, 
    MongooseModule.forFeatureAsync([
    {
      name: Product.name,
      useFactory: () => {
        const schema = ProductSchema

        schema.pre<ProductDocument>('save', async function(next: Function){
          if(!this.isModified('path')){return next()}
          this.pathString = this.path.map(x => capitalize(x)).join('/')
          next()
        })

        return schema
      }
    },
    {name: OrderItem.name, useFactory: () => OrderItemSchema}
    ])
],
  exports: [ProductsService]
})
export class ProductsModule {}
