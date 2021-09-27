import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import {ConfigModule} from '@nestjs/config'
import * as Joi from 'joi'
import {MongooseModule} from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { FilesModule } from './files/files.module';
import { LooksModule } from './looks/looks.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().default(5000),
        MONGO_URI: Joi.string().default('mongodb://localhost:27017/mellis2'),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRE: Joi.string().required(),
        // AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_BUCKET_URL: Joi.string().required(),
        AWS_BUCKET_NAME: Joi.string().required(),
      })
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    AuthModule,
    CaslModule,
    ProductsModule,
    CategoriesModule,
    FilesModule,
    LooksModule,
    OrdersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
