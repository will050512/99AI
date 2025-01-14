import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'models' })
export class ModelsEntity extends BaseEntity {
  @Column({ comment: '模型類型 1: 普通對話 2: 繪畫  3:高級對話' })
  keyType: number;

  @Column({ comment: '模型名稱' })
  modelName: string;

  @Column({ comment: '綁定的模型是？' })
  model: string;

  @Column({ length: 1024, comment: '模型頭像', nullable: true })
  modelAvatar: string;

  @Column({ comment: '模型排序', default: 1 })
  modelOrder: number;

  @Column({
    comment: '模型上下文支持的最大Token',
    default: 2000,
    nullable: true,
  })
  maxModelTokens: number;

  @Column({ comment: '模型上下文最大條數', nullable: true })
  maxRounds: number;

  @Column({ comment: '模型上下文最大條數', nullable: true })
  timeout: number;

  @Column({ comment: '模型單次調用扣除的次數', default: 1 })
  deduct: number;

  @Column({ comment: '模型扣除餘額類型 1: 普通模型 2: 高級模型', default: 1 })
  deductType: number;

  @Column({ comment: '是否使用token計費: 0:不是 1: 是', default: 0 })
  isTokenBased: boolean;

  @Column({
    comment: '是否支持文件上傳: 0:不是 1: 附件鏈接格式 2: 4V格式',
    default: 0,
  })
  isFileUpload: number;

  @Column({ comment: 'token計費比例', default: 0 })
  tokenFeeRatio: number;

  @Column({ comment: '模型附加資訊', nullable: true })
  remark: string;

  @Column({ comment: '模型的key', nullable: true })
  key: string;

  @Column({ comment: '使用的狀態: 0:禁用 1：啟用', default: 1 })
  status: boolean;

  @Column({
    comment: 'key的狀態: 1:有效  -1:被封號 -2: 錯誤的秘鑰 -3: 餘額使用完了',
    default: 1,
  })
  keyStatus: number;

  @Column({ comment: 'key的使用次數', default: 0 })
  useCount: number;

  @Column({ comment: 'key的已經使用的token數量', default: 0 })
  useToken: number;

  @Column({ comment: '當前模型的代理地址', nullable: true })
  proxyUrl: string;

  @Column({ comment: '模型頻率限制 次/小時', default: 999 })
  modelLimits: number;

  @Column({ comment: '模型介紹', nullable: true })
  modelDescription: string;
}
