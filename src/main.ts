import { NestFactory } from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common'
import { AppModule } from './app.module';
import {ConfigService} from '@nestjs/config'
import {config} from 'aws-sdk'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as session from 'express-session';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1)
  app.setGlobalPrefix('api/v1');
  const configService: ConfigService<EnvVars> = app.get(ConfigService)
  app.useGlobalPipes(new ValidationPipe())
  const corsWhitelist = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    configService.get('CLIENT_URI'), 
    configService.get('ADMIN_CONSOLE_URI')
  ]
  const corsOptions: CorsOptions = {
    credentials: true,
    origin: function (origin, callback) {
      if (corsWhitelist.includes(origin) || !origin) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
  app.enableCors(corsOptions)

  const sessionOptions = {
    cookie: {
      maxAge: 60*60*1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
      secure: process.env.NODE_ENV === "production"
      },
    secret: configService.get('COOKIE_SECRET'),
    resave: true,
    saveUninitialized: true,
    proxy: true
}
app.use(session(sessionOptions))
  
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    // region: configService.get('AWS_REGION')
  })
  await app.listen(process.env.PORT);
  console.log('Server listens on port ' + process.env.PORT)
}
bootstrap();
