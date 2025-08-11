import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  telegramId: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ default: false })
  gotShortcuts: boolean;

  @Column({ default: false })
  gotChecklist: boolean;

  @Column({ default: false })
  gotAItools: boolean;

  @Column({ default: 'new' })
  funnelStage: string; 

  @CreateDateColumn()
  createdAt: Date;
}
