import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'auto_reply' })
export class AutoReplyEntity extends BaseEntity {
  @Column({ comment: '提問的問題', type: 'text' })
  prompt: string;

  @Column({ comment: '定義的答案', type: 'text' })
  answer: string;

  @Column({ default: 1, comment: '是否開啟AI回覆，0：關閉 1：啟用' })
  isAIReplyEnabled: number;

  @Column({ default: 1, comment: '啟用當前自動回覆狀態， 0：關閉 1：啟用' })
  status: number;
}
