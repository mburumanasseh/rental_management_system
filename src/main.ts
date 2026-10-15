import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Required when running behind a reverse proxy (nginx, load balancer)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('nodeEnv') || 'development';
  const isProd = nodeEnv === 'production';

  // Security headers (helmet)
  app.use(
    helmet({
      contentSecurityPolicy: isProd ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global validation – strip unknown properties, transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS – configurable via CORS_ORIGIN (comma-separated) or locked down in production
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((o) => o.trim())
      : isProd
        ? false
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Optional global prefix
  const apiPrefix = process.env.API_PREFIX;
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
  if (isProd) {
    logger.log('Production mode – ensure secrets, HTTPS and CORS_ORIGIN are set');
  }
}

await bootstrap();
