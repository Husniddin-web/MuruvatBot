import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { TelegrafArgumentsHost } from "nestjs-telegraf";
import { Context, Markup } from "telegraf";

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const telegrafHost = TelegrafArgumentsHost.create(host);
    const ctx = telegrafHost.getContext<Context>();
    console.log(exception.name);
    if (exception.name == "ForbiddenException") {
      const [info, subs, subc] = exception.message.split("_");
      await ctx.reply(info, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: subs,
                url: "https://t.me/+Bl0EdInqgIAxY2Yy",
              },
            ],
            [
              {
                text: subc,
                callback_data: "check_subscription",
              },
            ],
          ],
        },
      });
    } else {
      await ctx.replyWithHTML(` ${exception.message}`, {
        ...Markup.removeKeyboard(),
      });
    }
  }
}
