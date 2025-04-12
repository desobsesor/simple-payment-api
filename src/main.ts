import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerExceptionFilter } from './contexts/shared/infrastructure/throttler/exceptions/throttler-exception.filter';
import { AppLoggerService } from './contexts/shared/infrastructure/logger/logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { validateEnvVars } from './config/env-validator';

async function bootstrap() {
  validateEnvVars();
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // Add file transport for error logging
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ],
    }),
  });

  app.enableCors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  const logger = new AppLoggerService();
  app.useLogger(logger);

  // Register the global exception filter for ThrottlerException
  app.useGlobalFilters(new ThrottlerExceptionFilter(logger));

  const config = new DocumentBuilder()
    .setTitle('Simple Payment API')
    .setDescription('Documentation for Simple Payment API')
    .setVersion('1.0')
    .addTag('Simple Payment')
    .build();

  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`API is running on: http://${process.env.HOST}:${process.env.PORT}`);
}
bootstrap();
