import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Payment } from '../payments/payment.entity';
import { BotUpdate } from './bot.update';
import { SchedulerService } from './scheduler.service';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Payment]),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({ token: cfg.get('8332081864:AAET6VuCm1MASQ_l2zbvGCQPyzvNB7dT1iM') }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotUpdate, SchedulerService, SubscriptionService],
})
export class TelegramModule {}
