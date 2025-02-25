import { Observable } from "rxjs";
import { Ctx, InjectBot } from "nestjs-telegraf";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Context, Markup, Telegraf } from "telegraf";
import { Bot } from "./entities/bot.entity";
import { Repository } from "typeorm";
import { language } from "./language";
import { uzbekRegions, uzbekRegionsWithDistricts } from "./region";
import { BOT_NAME } from "../app.constant";
import { copyFileSync } from "fs";
@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Bot) private readonly botRepo: Repository<Bot>,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}
  private messageId;
  private ADMIN = process.env.ADMIN_TOKEN;
  async start(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botRepo.findOne({ where: { user_id } });
      if (!user) {
        const inlineKeyboard = [
          [
            { text: "🇺🇿 Uzbek", callback_data: "lang_uz" },
            { text: "🇷🇺 Russian", callback_data: "lang_ru" },
          ],
        ];
        await ctx.reply("Выберите язык / Tilni tanlang:", {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });

        return;
      } else if (user.last_state !== "user_finished") {
        const state = user.last_state;
        switch (state) {
          case "user_name":
            await this.askName(ctx);
            break;

          case "user_role":
            await this.askRole(ctx);
            break;

          case "user_phone_number":
            await this.askPhoneNumber(ctx);
            break;

          case "user_location":
            await this.askLocation(ctx);
            break;

          case "user_region":
            await this.askRegion(ctx);
            break;

          case "user_district":
            await this.askDistrict(ctx);
            break;

          default:
            await ctx.reply("Something went wrong");
            break;
        }
      } else {
        if (user.role == "sahiy") {
          await this.showMainButtonSahiy(ctx);
        } else {
          await this.showMainButtonSabirli(ctx);
        }
      }
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async showMainButtonSahiy(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user.lang;

      const sahiyButtons = [
        [
          {
            text: language[lang].contact_admin,
            callback_data: "contact_admin",
          },
        ],
        [
          { text: language[lang].settings, callback_data: "settings" },
          { text: language[lang].patience, callback_data: "patience" },
        ],
      ];

      await ctx.reply(language[lang].welcome, {
        reply_markup: {
          inline_keyboard: sahiyButtons,
          remove_keyboard: true,
        },
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async showMainButtonSabirli(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user.lang;

      const sabirliButtons = [
        [
          {
            text: language[lang].contact_admin,
            callback_data: "contact_admin",
          },
        ],
        [
          { text: language[lang].murojat, callback_data: "murojat" },
          { text: language[lang].settings, callback_data: "settings" },
        ],
      ];

      await ctx.reply(language[lang].role_sabrli, {
        reply_markup: {
          inline_keyboard: sabirliButtons,
        },
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async setLangUser(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        const data = await ctx.callbackQuery!["data"];
        const lang = data.split("_")[1];
        await this.botRepo.save({ user_id, lang });
        await this.askRole(ctx);
        return;
      }
      await ctx.reply(language[user.lang]?.notogri_harakat);
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async askRole(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user.lang;

      const roleKeyboard = [
        [
          { text: language[lang].role_sahiy, callback_data: "role_sahiy" },
          { text: language[lang].role_sabrli, callback_data: "role_sabrli" },
        ],
      ];

      await ctx.reply(language[lang].ask_role, {
        reply_markup: {
          inline_keyboard: roleKeyboard,
        },
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async setRole(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const data = await ctx.callbackQuery!["data"];
      const role = data.split("_")[1];
      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }
      if (user.last_state == "user_role") {
        user.role = role;
        user.last_state = "user_name";
        await this.botRepo.save(user);
        await this.askName(ctx);
        return;
      }
      await ctx.reply(language[user.lang]?.notogri_harakat);
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async askName(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user.lang;

      await ctx.reply(language[lang].ask_name);
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async catchError(ctx: Context) {
    await ctx.reply("Server have some problem");
  }

  async askPhoneNumber(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user.lang || "uz";
      const phonePrompt = language[lang]?.ask_phone;

      const keyboard = {
        keyboard: [[{ text: `📞 ${phonePrompt}`, request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      };

      await ctx.reply(phonePrompt, {
        reply_markup: keyboard,
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async askLocation(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({
        where: { user_id },
      });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user.lang || "uz";

      const locationPrompt = language[lang]?.ask_location;

      const keyboard = [
        [
          {
            text: `📍 ${locationPrompt}`,
            request_location: true,
          },
        ],
      ];

      const message = await ctx.reply(locationPrompt, {
        reply_markup: {
          keyboard: keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async askRegion(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const lang = user ? user.lang : "uz";
      const role = user ? user.role : "";

      const regionButtons = uzbekRegions.map((region) => {
        return [
          {
            text: region,
            callback_data: `region_${region}`,
          },
        ];
      });

      if (role === "sahiy") {
        regionButtons.push([
          {
            text: language[lang].skip,
            callback_data: "region_skip",
          },
        ]);
      }

      await ctx.reply(language[user.lang].save, {
        reply_markup: {
          remove_keyboard: true,
        },
      });
      await ctx.reply(language[lang].ask_region, {
        reply_markup: {
          inline_keyboard: regionButtons,
        },
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async askDistrict(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        return await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
      }

      const region = user!.region;
      const lang = user!.lang;

      if (!region) {
        await ctx.reply("Region is not found");
        return;
      }

      const districts = uzbekRegionsWithDistricts[region];
      console.log(districts);
      const districtButtons = districts.map((district) => {
        return [
          {
            text: district,
            callback_data: `district_${district}`,
          },
        ];
      });

      await ctx.reply(language[lang].ask_district, {
        reply_markup: {
          inline_keyboard: districtButtons,
        },
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  // --- ON TEXT

  async onText(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      if ("text" in ctx.message!) {
        const text = ctx.message.text;
        const user = await this.botRepo.findOne({
          where: { user_id },
        });

        if (!user) {
          await ctx.reply(
            "User not found. Please restart the bot with /start command."
          );
          return;
        }

        if (user && user.last_state != "user_finished") {
          if (user.last_state == "user_name") {
            user.name = text;
            user.last_state = "user_phone_number";
            await this.botRepo.save(user);
            await this.askPhoneNumber(ctx);
            return;
          }
        }
        await ctx.deleteMessage();
      }
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  // --- ON CONTACT

  async onContact(ctx: Context) {
    try {
      if (!("contact" in ctx.message!)) {
        await ctx.reply("❌ Kontakt yuborilmadi!");
        return;
      }
      const user_id = ctx.from?.id;
      const phone_number = ctx.message.contact.phone_number;

      const user = await this.botRepo.findOne({ where: { user_id } });
      if (user) {
        if (user.last_state == "user_phone_number") {
          user.phone_number = phone_number;
          user.last_state = "user_region";
          await this.askRegion(ctx);
          await this.botRepo.save(user);
          return;
        }
        await ctx.deleteMessage();
      } else {
        await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
        return;
      }
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async setRegion(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const data = await ctx.callbackQuery!["data"];
      const region = data.split("_")[1];
      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
        return;
      }

      if (user?.last_state == "user_region") {
        console.log(region);
        if (region == "skip") {
          user!.last_state = "user_location";
          await ctx.telegram.deleteMessage(ctx.chat!.id, this.messageId);
          await this.askLocation(ctx);
          await this.botRepo.save(user!);
          return;
        }
        user!.region = region;
        user!.last_state = "user_district";
        await this.botRepo.save(user!);
        await this.askDistrict(ctx);
        return;
      }

      await ctx.reply(language[user!.lang].notogri_harakat);
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async setDistrict(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const data = await ctx.callbackQuery!["data"];
      const district = data.split("_")[1];
      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
        return;
      }

      if (user?.last_state == "user_district") {
        user!.district = district;
        user!.last_state = "user_location";
        await this.botRepo.save(user!);
        await this.askLocation(ctx);
        return;
      }
      await ctx.reply(language[user!.lang].notogri_harakat);
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  // --

  async onLocation(ctx: Context) {
    try {
      if (!("location" in ctx.message!)) {
        await ctx.reply("❌ Location yuborilmadi!");
        return;
      }
      const user_id = ctx.from?.id;
      const lat = ctx.message.location.latitude;
      const long = ctx.message.location.longitude;
      const loc = `${lat},${long}`;

      const user = await this.botRepo.findOne({ where: { user_id } });
      if (user) {
        if (user.last_state == "user_location") {
          user.location = loc;
          user.last_state = "user_finished";
          await this.botRepo.save(user);
          await ctx.reply(language[user.lang].save, {
            reply_markup: {
              remove_keyboard: true,
            },
          });
          if (user.role == "sahiy") {
            await this.showMainButtonSahiy(ctx);
          } else {
            await this.showMainButtonSabirli(ctx);
          }

          await this.sendToAdminMessage(ctx, user);
          return;
        }
        await ctx.deleteMessage();
      } else {
        await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
        return;
      }
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async contactAdmin(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
        return;
      }

      // Your existing contactAdmin logic
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async checkUserSubscription(
    userId: number,
    channelUsername: string
  ): Promise<boolean> {
    try {
      const chatMember = await this.bot.telegram.getChatMember(
        channelUsername,
        userId
      );
      return (
        chatMember.status === "member" ||
        chatMember.status === "administrator" ||
        chatMember.status === "creator"
      );
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false; // If there's an error or user isn't found, return false
    }
  }

  async sendToAdminMessage(ctx: Context, user: Bot) {
    try {
      const message = `
              📌 *Yangi ${user.role || "Foydalanuvchi"}* 📌

              👤 *Ism:* ${user.name || "Nomaʼlum"}
              📞 *Telefon:* ${user.phone_number || "Mavjud emas"}
              📍 *Manzil:* ${user.location || "Mavjud emas"}
              🌍 *Viloyat:* ${user.region || "Mavjud emas"}
              🏙️ *Tuman:* ${user.district || "Mavjud emas"}
              🗣 *Til:* ${user.lang || "Aniqlanmagan"}
              ✅ *Holat:* ${user.is_active ? "Faol" : "Faol emas"}
              🚫 *Bloklangan:* ${user.is_block ? "Ha" : "Yoʻq"}

              Foydalanuvchini tasdiqlaysizmi? ⬇️
                  `;

      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("✅ Tasdiqlash", `confirm_user_${user.id}`),
        Markup.button.callback("❌ Bekor qilish", `cancel_user_${user.id}`),
      ]);

      await ctx.telegram.sendMessage(this.ADMIN!, message, {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      });
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async checkUserSubsribe(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const channelUsername = "@muruvat_savob";
      const user = await this.botRepo.findOne({ where: { user_id } });

      if (!user) {
        await ctx.reply(
          "User not found. Please restart the bot with /start command."
        );
        return;
      }

      const isSub = await this.checkUserSubscription(user_id!, channelUsername);
      if (isSub) {
        if (user?.role == "sahiy") {
          await this.showMainButtonSahiy(ctx);
          return;
        } else {
          await this.showMainButtonSabirli(ctx);
        }
      } else {
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
      }
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }

  async confirmUser(ctx: Context) {
    try {
      const data = await ctx.callbackQuery!["data"];
      const user_id = parseInt(data.split("_")[2]);

      const user = await this.botRepo.findOne({ where: { id: user_id } });

      if (!user) {
        return await ctx.editMessageText("❌ Foydalanuvchi topilmadi!");
      }
      if (user.is_active) {
        await ctx.editMessageText("Bu foydalanuvchi avval aktiv bolgan ");
        return;
      }

      user.is_active = true;
      await this.botRepo.save(user);

      await ctx.telegram.sendMessage(user.user_id, language[user.lang].confirm);

      await ctx.editMessageText(`✅ ${user.name} muvaffaqiyatli tasdiqlandi!`);
    } catch (error) {
      console.log(error);
      await this.catchError(ctx);
    }
  }
}
