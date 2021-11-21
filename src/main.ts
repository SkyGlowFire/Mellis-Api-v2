import { NestFactory } from '@nestjs/core';
import {BadRequestException, ValidationPipe} from '@nestjs/common'
import { AppModule } from './app.module';
import {ConfigService} from '@nestjs/config'
import {config} from 'aws-sdk'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser = require('cookie-parser')
import {capitalize} from 'src/utils/textFormatters'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {logger: console});
  app.set('trust proxy', 1)
  app.setGlobalPrefix('api/v1');
  const configService: ConfigService<EnvVars> = app.get(ConfigService)
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      const messages = errors.map(err => Object.values(err.constraints)
      .map(constraint => capitalize(constraint))
      .join(', '))
      return new BadRequestException(messages)
    },
    transform: true
  }))
  app.use(cookieParser(configService.get('COOKIE_SECRET')))
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
  
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
  })
  await app.listen(process.env.PORT || 3000);
  console.log('Server listens on port ' + process.env.PORT)
}
bootstrap();
