import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.Frontend_URL], // 👈 Replace with your frontend URL
    credentials: true, // 👈 Needed if you're sending cookies/auth headers
  });

  const config = new DocumentBuilder()
    .setTitle('Bug Tracker Pro API')
    .setDescription('The API documentation for Bug Tracker Pro backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3001);
}
bootstrap();
