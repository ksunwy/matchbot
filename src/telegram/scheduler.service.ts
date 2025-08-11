import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/user.entity';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  @Cron('*/1 * * * *')
  async run() {
    const now = new Date();

    const t0 = new Date(now.getTime() - 30 * 60 * 1000);
    const usersDay0 = await this.usersRepo.createQueryBuilder('u')
      .where('u.createdAt BETWEEN :from AND :to', { from: t0.toISOString(), to: now.toISOString() })
      .andWhere('u.funnelStage = :stage', { stage: 'new' })
      .getMany();

    for (const u of usersDay0) {
      try {
        await this.bot.telegram.sendMessage(u.telegramId, 'Привет! Ты уже забрал бесплатники? 📚');
        u.funnelStage = 'received_free';
        await this.usersRepo.save(u);
      } catch (e) {
        this.logger.warn(`Не удалось отправить Day0 пользователю ${u.telegramId}: ${e.message}`);
      }
    }

  }
}
