import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'violation_log' })
export class ViolationLogEntity extends BaseEntity {
  @Column({ comment: '用戶id' })
  userId: number;

  @Column({ comment: '違規內容', type: 'text' })
  content: string;

  @Column({ comment: '敏感詞', type: 'text' })
  words: string;

  @Column({ comment: '違規類型' })
  typeCn: string;

  @Column({ comment: '違規檢測失敗於哪個平臺' })
  typeOriginCn: string;
}
