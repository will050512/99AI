import { UserStatusEnum } from '../../common/constants/user.constant';
import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'signin' })
export class SigninEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '簽到日期' })
  signInDate: string;

  @Column({ comment: '簽到時間' })
  signInTime: Date;

  @Column({ default: false })
  isSigned: boolean;
}
