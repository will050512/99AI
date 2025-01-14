import { UserStatusEnum } from '../../common/constants/user.constant';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'crami_package' })
export class CramiPackageEntity extends BaseEntity {
  @Column({ unique: true, comment: '套餐名稱' })
  name: string;

  @Column({ comment: '套餐介紹詳細資訊' })
  des: string;

  @Column({ comment: '套餐封面圖片', nullable: true })
  coverImg: string;

  @Column({ comment: '套餐價格NT$', type: 'decimal', scale: 0, precision: 10 })
  price: number;

  @Column({ comment: '套餐排序、數字越大越靠前', default: 100 })
  order: number;

  @Column({ comment: '套餐是否啟用中 0：禁用 1：啟用', default: 1 })
  status: number;

  @Column({ comment: '套餐權重、數字越大表示套餐等級越高越貴', unique: true })
  weight: number;

  @Column({ comment: '序號有效期天數、從使用的時候開始計算，設為-1則不限時間', default: 0 })
  days: number;

  @Column({ comment: '套餐包含的模型3數量', default: 0, nullable: true })
  model3Count: number;

  @Column({ comment: '套餐包含的模型4數量', default: 0, nullable: true })
  model4Count: number;

  @Column({ comment: '套餐包含的MJ繪畫數量', default: 0, nullable: true })
  drawMjCount: number;
}
