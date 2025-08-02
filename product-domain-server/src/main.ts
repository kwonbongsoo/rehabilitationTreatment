import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DataInitializerService } from '@services/data-initializer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  const config = new DocumentBuilder()
    .setTitle('Product Domain API')
    .setDescription('상품 도메인 마이크로서비스 API')
    .setVersion('1.0')
    .addTag('Products', '상품 관리')
    .addTag('Categories', '카테고리 관리')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('PORT', 3002);
  await app.listen(port);

  // 서버 시작 후 데이터 초기화 (비동기)
  setTimeout(async () => {
    try {
      const dataInitializer = app.get(DataInitializerService);
      await dataInitializer.initializeData();
    } catch (error) {
      console.error('데이터 초기화 중 오류:', error);
    }
  }, 2000); // 2초 후 실행

  console.log(
    `🚀 Product Domain Server is running on: http://localhost:${port}`,
  );
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
