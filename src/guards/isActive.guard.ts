import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TelegrafExecutionContext } from "nestjs-telegraf";
import { Context } from "telegraf";
import { Bot } from "../bot/entities/bot.entity";
import { Repository } from "typeorm";
import { language } from "../bot/language";

@Injectable()
export class UserIsActiveGuard implements CanActivate {
  constructor(@InjectRepository(Bot) private botRepo: Repository<Bot>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const botContext = ctx.getContext<Context>();
    const { from } = botContext;

    console.log("Keldi");

    // Find user in the database
    const user = await this.botRepo.findOne({
      where: { user_id: from!.id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    // If user not found or not active, send a message and return false
    if (!user!.is_active) {
      throw new NotFoundException(language[user!.lang].admin_respone);
    }

    return true; // Allow access
  }
}
