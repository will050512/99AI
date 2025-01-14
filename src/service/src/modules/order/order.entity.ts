import { UserStatusEnum } from '../../common/constants/user.constant';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'order' })
export class OrderEntity extends BaseEntity {
  @Column({ unique: true, comment: '訂單ID', length: 64 })
  orderId: string;

  @Column({ unique: true, comment: '交易ID（服務商）', length: 32, nullable: true })
  tradeId: string;

  @Column({ comment: '支付平臺【epay|hupi|ltzf】）', length: 32, nullable: true })
  payPlatform: string;

  @Column({ comment: '用戶ID', nullable: true })
  userId: number;

  @Column({ comment: '商品ID', nullable: true })
  goodsId: number;

  @Column({ comment: '數量', default: 1 })
  count: number;

  @Column({ comment: '套餐價格NT$', type: 'decimal', scale: 0, precision: 10 })
  price: number;

  @Column({ comment: '訂單總金額', type: 'decimal', scale: 0, precision: 10 })
  total: number;

  @Column({ comment: '訂單狀態（0：未支付、1：已支付、2、支付失敗、3：支付超時）', default: 0 })
  status: number;

  @Column({ type: 'datetime', length: 0, nullable: true, comment: '支付時間' })
  paydAt: Date;

  @Column({ comment: '支付渠道）', length: 32, nullable: true })
  channel: string;
}
