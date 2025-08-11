import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class SubscriptionService {
  private readonly requiredChannel = '@webdevmatch';

  async isUserSubscribed(ctx: Context): Promise<boolean> {
    try {
      const member = await ctx.telegram.getChatMember(this.requiredChannel, ctx.from.id);
      return ['creator', 'administrator', 'member'].includes(member.status);
    } catch {
      return false;
    }
  }
}