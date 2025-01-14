import { UserStatusEnum } from '../../common/constants/user.constant';
import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'account_log' })
export class AccountLogEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '會員套餐名稱', nullable: true })
  pkgName: string;

  @Column({ comment: '推薦人ID、返傭用戶ID', nullable: true })
  rebateUserId: number;

  @Column({ comment: '充值套餐ID', nullable: true })
  packageId: number;

  @Column({ comment: '會員有效天數', nullable: true })
  memberDays: number;

  @Column({ comment: '賬戶充值類型' })
  rechargeType: number;

  @Column({ comment: '模型3對話次數' })
  model3Count: number;

  @Column({ comment: '模型4對話次數' })
  model4Count: number;

  @Column({ comment: 'MJ繪畫次數' })
  drawMjCount: number;

  @Column({ comment: '套餐有效期' })
  days: number;

  @Column({ comment: '隨機訂單uid' })
  uid: string;

  @Column({ comment: '擴展字段', nullable: true })
  extent: string;
}
