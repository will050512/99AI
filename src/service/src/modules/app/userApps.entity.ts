import { UserStatusEnum } from '../../common/constants/user.constant';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'user_apps' })
export class UserAppsEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '應用ID' })
  appId: number;

  @Column({ comment: '應用分類ID' })
  catId: number;

  @Column({ comment: 'app類型 system/user', default: 'user' })
  appType: string;

  @Column({ comment: '是否公開到公告菜單', default: false })
  public: boolean;

  @Column({ comment: 'app狀態 1正常 2審核 3違規', default: 1 })
  status: number;

  @Column({ comment: 'App應用排序、數字越大越靠前', default: 100 })
  order: number;
}
