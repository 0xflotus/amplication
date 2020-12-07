import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
// @ts-ignore
// eslint-disable-next-line
import { AppModule } from "./app.module";
// @ts-ignore
// eslint-disable-next-line
import { swaggerDocumentOptions, swaggerSetupOptions } from "./swagger";

const { PORT = 3000 } = process.env;

async function main() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  const document = SwaggerModule.createDocument(app, swaggerDocumentOptions);

  SwaggerModule.setup("", app, document, swaggerSetupOptions);

  void app.listen(PORT);

  return app;
}

module.exports = main();
