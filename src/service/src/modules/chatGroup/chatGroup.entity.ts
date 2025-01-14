import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'chat_group' })
export class ChatGroupEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '是否置頂聊天', type: 'boolean', default: false })
  isSticky: boolean;

  @Column({ comment: '分組名稱', nullable: true })
  title: string;

  @Column({ comment: '應用ID', nullable: true })
  appId: number;

  // @Column({ comment: '模型', nullable: true })
  // model: string;

  // @Column({ comment: '模型名稱', nullable: true })
  // modelName: string;

  // @Column({ comment: '扣費類型', nullable: true })
  // mdeductType: string;

  // @Column({ comment: '是否支持文件上傳', nullable: true })
  // isFileUpload: boolean;

  // @Column({ comment: '是否固定模型', default: 0 })
  // isFixedModel: boolean;

  // @Column({ comment: '模型類型', nullable: true })
  // keyType: number;

  @Column({ comment: '是否刪除了', default: false })
  isDelete: boolean;

  @Column({ comment: '配置', nullable: true, default: null, type: 'text' })
  config: string;

  @Column({ comment: '附加參數', nullable: true, type: 'text' })
  params: string;

  @Column({ comment: '文件鏈接', nullable: true, default: null, type: 'text' })
  fileUrl: string;

  @Column({ comment: 'PDF中的文字內容', nullable: true, type: 'mediumtext' })
  pdfTextContent: string;
}
