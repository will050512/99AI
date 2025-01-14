import { UserStatusEnum } from '../../common/constants/user.constant';
import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'balance' })
export class BalanceEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '用戶賬戶餘額' })
  balance: number;

  @Column({ comment: '用戶使用次數餘額' })
  usesLeft: number;

  @Column({ comment: '繪畫使用次數餘額' })
  paintCount: number;

  @Column({ default: 0, comment: '用戶總計使用的token數量' })
  useTokens: number;

  @Column({ default: 0, comment: '用戶總計使用的對話次數' })
  useChats: number;

  @Column({ default: 0, comment: '用戶總計使用的繪畫次數' })
  usePaints: number;
}
