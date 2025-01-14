import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'datetime', length: 0, nullable: false, name: 'createdAt', comment: '創建時間' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', length: 0, nullable: false, name: 'updatedAt', comment: '更新時間' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', length: 0, nullable: false, name: 'deletedAt', comment: '刪除時間' })
  deletedAt: Date;
}
