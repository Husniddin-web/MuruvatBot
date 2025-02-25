import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "./bot.service";
import { UseFilters, UseGuards } from "@nestjs/common";
import { SubscriptionGuard } from "../guards/subscribe.guard";
import { WorkerBanGuard } from "../guards/ban.guard";
import { TelegrafExceptionFilter } from "../filters/botfilter";
import { UserIsActiveGuard } from "../guards/isActive.guard";

@UseFilters(TelegrafExceptionFilter)
@UseGuards(WorkerBanGuard)
@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Action(/^role_/)
  async setRole(@Ctx() ctx: Context) {
    await this.botService.setRole(ctx);
  }

  @Action(/^lang_/)
  async setLangUser(@Ctx() ctx: Context) {
    await this.botService.setLangUser(ctx);
  }

  @Action(/^region_/)
  async setRegion(@Ctx() ctx: Context) {
    await this.botService.setRegion(ctx);
  }

  @Action(/^contact_admin/)
  @UseGuards(UserIsActiveGuard)
  @UseGuards(SubscriptionGuard)
  async contactAdmin(@Ctx() ctx: Context) {
    await this.botService.contactAdmin(ctx);
  }

  @Action(/check_subscription/)
  async checkUserSubsribe(@Ctx() ctx: Context) {
    await this.botService.checkUserSubsribe(ctx);
  }
  @Action(/^district_/)
  async setDistrict(@Ctx() ctx: Context) {
    await this.botService.setDistrict(ctx);
  }
  // Get the user's language (default to 'uz' if no language is set)

  @On("text")
  async onText(@Ctx() ctx: Context) {
    await this.botService.onText(ctx);
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    await this.botService.onLocation(ctx);
  }

  @Action(/^confirm_user_/)
  async confirmUser(@Ctx() ctx: Context) {
    await this.botService.confirmUser(ctx);
  }
}
