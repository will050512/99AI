import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'plugin' })
export class PluginEntity extends BaseEntity {
  @Column({ unique: true, comment: '外掛名稱' })
  name: string;

  @Column({ comment: '外掛封面', nullable: true, type: 'text' })
  pluginImg: string;

  @Column({ comment: '外掛描述' })
  description: string;

  @Column({ comment: '外掛是否啟用 0：禁用 1：啟用', default: 1 })
  isEnabled: number;

  @Column({ comment: '外掛是否為系統外掛 0：否 1：是', default: 0 })
  isSystemPlugin: number;

  @Column({ comment: '調用參數', type: 'text' })
  parameters: string;

  @Column({ comment: '排序值', default: 0 })
  sortOrder: number;
}
