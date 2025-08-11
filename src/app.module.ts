import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from './telegram/telegram.module';
import { User } from './users/user.entity';
import { Payment } from './payments/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: Number(cfg.get('DB_PORT')),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASS'),
        database: cfg.get('DB_NAME'),
        entities: [User, Payment, __dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // dev only! 
      }),
      inject: [ConfigService],
    }),
    TelegramModule,
  ],
})
export class AppModule {}
