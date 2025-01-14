import { UserStatusEnum } from '../../common/constants/user.constant';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'crami' })
export class CramiEntity extends BaseEntity {
  @Column({ unique: true, comment: '儲存序號CDK編碼', length: 50 })
  code: string;

  @Column({ comment: '序號CDK類型：1： 普通 | 2： 單人可使用一次 ', default: 1 })
  cramiType: number;

  @Column({ comment: '序號CDK類型： 默認套餐類型 | 不填就是自定義類型', nullable: true })
  packageId: number;

  @Column({ comment: '序號CDK狀態，如已使用、未使用等', default: 0 })
  status: number;

  @Column({ comment: '序號使用賬戶用戶ID資訊', nullable: true })
  useId: number;

  @Column({ comment: '序號有效期天數、從生成創建的時候開始計算，設為0則不限時間', default: 0 })
  days: number;

  @Column({ comment: '序號模型3額度', nullable: true })
  model3Count: number;

  @Column({ comment: '序號模型4額度', nullable: true })
  model4Count: number;

  @Column({ comment: '序號MJ繪畫額度', nullable: true })
  drawMjCount: number;
}
