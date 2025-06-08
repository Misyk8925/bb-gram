import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import {ConsoleLogger, Logger} from "@nestjs/common";
import {CatchEverythingFilter} from "./common/filters/catch.everything.filter";
import {AllExceptionsFilter} from "./common/filters/all.exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapterHost= app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
