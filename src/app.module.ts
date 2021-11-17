import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { APP_FILTER} from '@nestjs/core';
import {HttpExceptionFilter} from './http-exception.filter'
import { AppLoggerMiddleware } from './middleware/app-logger.middleware';
import { EmailModule } from './email/email.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import {join} from 'path'

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
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        CLIENT_URI: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_BUCKET_URL: Joi.string().required(),
        AWS_BUCKET_NAME: Joi.string().required(),
        GMAIL_USER: Joi.string().required(),
        GMAIL_PASSWORD: Joi.string().required(),
        FROM_NAME: Joi.string().required(),
        FROM_EMAIL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        FACEBOOK_CLIENT_ID: Joi.string().required(),
        FACEBOOK_CLIENT_SECRET: Joi.string().required(),
        VK_CLIENT_ID: Joi.string().required(),
        VK_CLIENT_SECRET: Joi.string().required(),
      })
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ServeStaticModule.forRoot({rootPath: join(__dirname,  'public')}),
    UsersModule,
    AuthModule,
    CaslModule,
    ProductsModule,
    CategoriesModule,
    FilesModule,
    LooksModule,
    OrdersModule,
    EmailModule
  ],
  controllers: [],
  providers: [{
    provide: APP_FILTER,
    useClass: HttpExceptionFilter
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void{
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
