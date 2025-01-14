import { UserStatusEnum } from '../../common/constants/user.constant';
import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'fingerprint_log' })
export class FingerprintLogEntity extends BaseEntity {
  @Column({ comment: '指紋ID' })
  fingerprint: string;
  
  @Column({ comment: '模型3對話次數' })
  model3Count: number;

  @Column({ comment: '模型4對話次數' })
  model4Count: number;

  @Column({ comment: 'MJ繪畫次數' })
  drawMjCount: number;
}
