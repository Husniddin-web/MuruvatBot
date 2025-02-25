import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BotUpdate } from "./bot.update";
import { Bot } from "./entities/bot.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Bot])],
  providers: [BotUpdate, BotService],
  exports: [BotService],
})
export class BotModule {}
