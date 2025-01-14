import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'app' })
export class AppEntity extends BaseEntity {
  @Column({ unique: true, comment: 'App應用名稱' })
  name: string;

  @Column({ comment: 'App分類Id' })
  catId: number;

  @Column({ comment: 'App應用描述資訊' })
  des: string;

  @Column({ comment: 'App應用預設場景資訊', type: 'text' })
  preset: string;

  @Column({ comment: 'App應用封面圖片', nullable: true, type: 'text' })
  coverImg: string;

  @Column({ comment: 'App應用排序、數字越大越靠前', default: 100 })
  order: number;

  @Column({ comment: 'App應用是否啟用中 0：禁用 1：啟用', default: 1 })
  status: number;

  @Column({ comment: 'App示例數據', nullable: true, type: 'text' })
  demoData: string;

  @Column({ comment: 'App應用角色 system  user', default: 'system' })
  role: string;

  @Column({ comment: 'App應用是否是GPTs', default: '0' })
  isGPTs: number;

  @Column({ comment: 'App應用是否是固定使用模型', default: '0' })
  isFixedModel: number;

  @Column({ comment: 'App應用使用的模型', type: 'text' })
  appModel: string;

  @Column({ comment: 'GPTs 的調用ID', default: '' })
  gizmoID: string;

  @Column({ comment: 'App是否共享到應用廣場', default: false })
  public: boolean;

  @Column({ comment: '用戶Id', nullable: true })
  userId: number;

  @Column({ comment: '是否系統預留', default: false, nullable: true })
  isSystemReserved: boolean;
}
