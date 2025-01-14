import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'config' })
export class ConfigEntity extends BaseEntity {
  @Column({ length: 255, comment: '配置名稱', nullable: true })
  configKey: string;

  @Column({ type: 'text', comment: '配置內容', nullable: true })
  configVal: string;

  @Column({
    default: 0,
    comment: '配置是否公開，公開內容對前端項目展示  0：不公開 1：公開',
  })
  public: number;

  @Column({
    default: 0,
    comment: '配置是否加密，加密內容僅僅super權限可看 0：不加 1：加',
  })
  encry: number;

  @Column({ default: 1, comment: '配置狀態 0:關閉 1：啟用' })
  status: number;
}
