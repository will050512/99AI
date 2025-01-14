import { UserStatusEnum } from '../../common/constants/user.constant';
import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'user_balances' })
export class UserBalanceEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '充值的套餐包含的模型3次數', nullable: true })
  model3Count: number;

  @Column({ comment: '充值的套餐包含的模型4次數', nullable: true })
  model4Count: number;

  @Column({ comment: '充值的套餐包含的MJ繪畫次數', nullable: true })
  drawMjCount: number;

  @Column({ comment: '當前使用的套餐ID', default: 0, nullable: true })
  packageId: number;

  @Column({ comment: '會員模型3額度', default: 0, nullable: true })
  memberModel3Count: number;

  @Column({ comment: '會員模型4額度', default: 0, nullable: true })
  memberModel4Count: number;

  @Column({ comment: '會員MJ繪畫額度', default: 0, nullable: true })
  memberDrawMjCount: number;

  @Column({ comment: '已經使用的對話3的模型次數', nullable: true })
  useModel3Count: number;

  @Column({ comment: '已經使用的對話4的模型次數', nullable: true })
  useModel4Count: number;

  @Column({ comment: '已經使用的對話3的模型Token', nullable: true })
  useModel3Token: number;

  @Column({ comment: '已經使用的對話4的模型Token', nullable: true })
  useModel4Token: number;

  @Column({ comment: '已經使用的MJ繪畫Token', nullable: true })
  useDrawMjToken: number;

  @Column({ comment: '擴展字段', nullable: true })
  extent: string;

  @Column({ comment: '會員到期時間', nullable: true })
  expirationTime: Date;
}
