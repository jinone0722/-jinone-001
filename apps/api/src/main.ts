import "reflect-metadata";
import express from "express";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === "production" ? ["error", "warn", "log"] : ["error", "warn", "log", "debug"]
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const uploadRoot = resolve(process.env.UPLOAD_DIR ?? "./uploads");
  mkdirSync(uploadRoot, { recursive: true });
  app.use("/uploads", express.static(uploadRoot));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  Logger.log(`WorkSphere AI API listening on ${port}`);
}

void bootstrap();
