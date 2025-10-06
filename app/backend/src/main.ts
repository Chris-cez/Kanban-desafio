import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('Documentação da API para o desafio Kanban Full Stack')
    .setVersion('1.0')
    .addBearerAuth() // Adiciona um campo para inserir o token JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // A UI do Swagger ficará em /docs
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors();
  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
