import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

@Controller('payments')
export class PaymentsController {
  constructor(
    @InjectRepository(Payment) private payRepo: Repository<Payment>,
    @InjectBot() private bot: Telegraf<any>,
  ) {}

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const body = req.body;
    const orderId = body.orderId; 
    const payment = await this.payRepo.findOne({ where: { id: orderId }});
    if (!payment) {
      return res.status(404).send('not found');
    }
    if (body.status === 'success') {
      payment.status = 'success';
      await this.payRepo.save(payment);

      await this.bot.telegram.sendDocument(payment.userTelegramId, {
        source: `./assets/products/${payment.product}.zip`,
      }, { caption: `Спасибо за покупку — ваш ${payment.product}`});
    }
    return res.status(200).send('ok');
  }
}
