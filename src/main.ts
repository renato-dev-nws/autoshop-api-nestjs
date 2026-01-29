import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Snake case interceptor
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Vehicles Shop API')
    .setDescription('API para gestão de estoque de veículos multi-loja')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Public', 'Endpoints públicos de busca')
    .addTag('Vehicles (Admin)', 'Gestão de veículos (protegido)')
    .addTag('Photos (Admin)', 'Gestão de fotos (protegido)')
    .addTag('Users (Admin)', 'Gestão de usuários (apenas admin)')
    .addTag('Stores (Admin)', 'Gestão de lojas (apenas admin)')
    .addTag('Taxonomy (Admin)', 'Gestão de tipos, marcas e modelos')
    .addTag('FIPE', 'Integração com API FIPE')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/swagger`);
}
bootstrap();
