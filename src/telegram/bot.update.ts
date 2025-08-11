import { Update, Start, Hears, On, Ctx } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Payment } from '../payments/payment.entity';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import * as path from 'path';
import { SubscriptionService } from './services/subscription.service';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Payment) private payRepo: Repository<Payment>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Start()
  async start(ctx: Context) {
    try {
      const tgId = String(ctx.from.id);
      const exists = await this.usersRepo.findOne({ where: { telegramId: tgId } });
      if (!exists) {
        const user = this.usersRepo.create({
          telegramId: tgId,
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
        });
        await this.usersRepo.save(user);
      }

      await ctx.reply(
        `Привет 👋\n\n` +
        `Я подготовил для тебя подборку полезных материалов, которые помогут:\n\n` +
        `🚀 Ускорить разработку — меньше рутины, больше кода;\n` +
        `🎨 Улучшить UI — даже без помощи дизайнера;\n` +
        `🧹 Делать код чище — понятным и поддерживаемым.\n\n` +
        `Выбери интересующий раздел ниже, чтобы начать 📚✨`,
        Markup.keyboard([
          ['📚 Бесплатные материалы', '💎 Платные продукты'],
          ['📬 Связаться']
        ]).resize()
      );
    } catch (error) {
      console.error('Error in start:', error);
      await ctx.reply('Произошла ошибка при старте бота. Попробуйте позже.');
    }
  }

  @Hears('📚 Бесплатные материалы')
  async freeMaterials(ctx: Context) {
    try {
      const subscribed = await this.subscriptionService.isUserSubscribed(ctx);
      if (!subscribed) {
        await ctx.reply(
          `🚫 Для доступа к бесплатным материалам, пожалуйста, подпишись на канал @webdevmatch.\n\n` +
          `После подписки нажми кнопку ниже.`,
          Markup.inlineKeyboard([
            [Markup.button.url('Подписаться на канал', 'https://t.me/webdevmatch')],
            [Markup.button.callback('Проверить подписку', 'check_subscription')],
            [Markup.button.callback('⬅️ Назад', 'main_menu')]
          ])
        );
        return;
      }

      await ctx.reply(
        `Вот что доступно бесплатно:`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📄 Frontend Shortcuts', 'free_shortcuts')],
          [Markup.button.callback('⬅️ Назад', 'main_menu')]
        ])
      );
    } catch (error) {
      console.error('Error in freeMaterials:', error);
      await ctx.reply('Не удалось загрузить бесплатные материалы. Попробуйте позже.');
    }
  }

  @Hears('💎 Платные продукты')
  async paidProducts(ctx: Context) {
    try {
      await ctx.reply(
        `Пока что платные материалы не добавлены.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('⬅️ Назад', 'main_menu')]
        ])
      );
    } catch (error) {
      console.error('Error in paidProducts:', error);
      await ctx.reply('Не удалось загрузить платные продукты. Попробуйте позже.');
    }
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    const callbackData = callbackQuery.data;

    try {
      switch (callbackData) {
        case 'free_shortcuts': {
          const filePath = path.resolve('src/files/frontend_shortcuts.pdf');
          await ctx.answerCbQuery();
          await ctx.replyWithDocument({ source: filePath, filename: 'Frontend_Shortcuts.pdf' });
          break;
        }

        case 'main_menu': {
          await ctx.answerCbQuery();
          await ctx.reply(
            `Главное меню. Выбери опцию:`,
            Markup.keyboard([
              ['📚 Бесплатные материалы', '💎 Платные продукты'],
              ['📬 Связаться']
            ]).resize()
          );
          break;
        }

        case 'check_subscription': {
          await ctx.answerCbQuery();
          const subscribed = await this.subscriptionService.isUserSubscribed(ctx);
          if (subscribed) {
            await ctx.reply('🎉 Спасибо за подписку! Теперь ты можешь получить бесплатные материалы.');
            await this.freeMaterials(ctx);
          } else {
            await ctx.reply(
              `😕 Кажется, ты ещё не подписался на канал @webdevmatch.\n` +
              `Пожалуйста, подпишись и попробуй снова.`
            );
          }
          break;
        }

        default:
          await ctx.answerCbQuery('❌ Неизвестная команда');
          break;
      }
    } catch (error) {
      console.error('Error in callback query handler:', error);
      await ctx.answerCbQuery('Произошла ошибка. Попробуйте позже.');
    }
  }

  @Hears('📬 Связаться')
  async contact(ctx: Context) {
    try {
      await ctx.reply('📬 Пиши сюда: @ksunnw\nОтвечаю в течение 24 часов.');
    } catch (error) {
      console.error('Error in contact:', error);
      await ctx.reply('Не удалось отправить контактную информацию. Попробуйте позже.');
    }
  }
}
