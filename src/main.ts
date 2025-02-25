import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3003
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () => {
    console.log("Server ishga tushdi ",PORT)
  });
}
bootstrap();
