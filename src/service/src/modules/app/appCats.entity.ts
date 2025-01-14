import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'app_cats' })
export class AppCatsEntity extends BaseEntity {
  @Column({ unique: true, comment: 'App分類名稱' })
  name: string;

  @Column({ comment: 'App分類排序、數字越大越靠前', default: 100 })
  order: number;

  @Column({ comment: 'App分類是否啟用中 0：禁用 1：啟用', default: 1 })
  status: number;
}
