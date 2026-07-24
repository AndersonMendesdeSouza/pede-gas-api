import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const defaultCorsOrigins = ['https://pede-gas-page.vercel.app'];
  const configuredCorsOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigins = [...defaultCorsOrigins, ...configuredCorsOrigins];
  const localDevelopmentOrigin =
    /^https?:\/\/(localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      const isAllowedConfiguredOrigin =
        origin && corsOrigins.includes(origin);
      const isAllowedLocalDevelopmentOrigin =
        process.env.NODE_ENV !== 'production' &&
        origin &&
        localDevelopmentOrigin.test(origin);

      if (!origin || isAllowedConfiguredOrigin || isAllowedLocalDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '0.0.0.0');
  Logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
