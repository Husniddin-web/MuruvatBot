import { Module } from "@nestjs/common";
import { BotModule } from "./bot/bot.module";
import { ConfigModule } from "@nestjs/config";
import { TelegrafModule } from "nestjs-telegraf";
import { BOT_NAME } from "./app.constant";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bot } from "./bot/entities/bot.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN || "dddasdadwefewcwd",
        middlewares: [],
        include: [BotModule],
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Bot],
      synchronize: true,
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
