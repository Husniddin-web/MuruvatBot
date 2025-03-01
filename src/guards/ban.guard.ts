import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TelegrafException, TelegrafExecutionContext } from "nestjs-telegraf";
import { Context } from "telegraf";
import { Bot } from "../bot/entities/bot.entity";
import { Repository } from "typeorm";
import { language } from "../bot/language";

@Injectable()
export class WorkerBanGuard implements CanActivate {
  constructor(@InjectRepository(Bot) private botRepo: Repository<Bot>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const botContext = ctx.getContext<Context>();
    const { from } = botContext;
    const user = await this.botRepo.findOne({
      where: { user_id: from!.id },
    });

    if (!user) {
      return true;
    }

    if (user!.is_block) {
      throw new NotFoundException(language[user.lang].ban);
    }

    return true;
  }
}
