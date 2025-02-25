import { subscribe } from "diagnostics_channel";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Context } from "telegraf";
import { Observable } from "rxjs";
import { BotService } from "../bot/bot.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Bot } from "../bot/entities/bot.entity";
import { Repository } from "typeorm";
import { language } from "../bot/language";

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly botService: BotService,
    @InjectRepository(Bot) private botRepo: Repository<Bot>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest<Context>();
    const userId = ctx.from?.id;
    const user = await this.botRepo.findOne({ where: { user_id: userId } });
    const channelUsername = "@muruvat_savob";
    const isSubscribed = await this.botService.checkUserSubscription(
      userId!,
      channelUsername
    );

    if (!isSubscribed) {
      await ctx.reply(language[user!.lang].subs, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: language[user!.lang].subscribe,
                url: "https://t.me/+Bl0EdInqgIAxY2Yy",
              },
            ],
            [
              {
                text: language[user!.lang].subscribed,
                callback_data: "check_subscription",
              },
            ],
          ],
        },
      });

      return false;
    }

    return true;
  }
}
