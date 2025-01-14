import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'chatlog' })
export class ChatLogEntity extends BaseEntity {
  @Column({ comment: '用戶ID' })
  userId: number;

  @Column({ comment: '使用的模型', nullable: true })
  model: string;

  @Column({
    comment: '使用類型1: 普通對話 2: 繪圖 3: 拓展性對話',
    nullable: true,
    default: 1,
  })
  type: number;

  @Column({ comment: '自定義的模型名稱', nullable: true, default: 'AI' })
  modelName: string;

  @Column({ comment: '自定義的模型名稱', nullable: false, default: '' })
  modelAvatar: string;

  @Column({ comment: 'Ip地址', nullable: true })
  curIp: string;

  @Column({ comment: '詢問的問題', type: 'text', nullable: true })
  prompt: string;

  @Column({ comment: '附加參數', nullable: true })
  extraParam: string;

  @Column({ comment: '外掛參數', nullable: true })
  pluginParam: string;

  @Column({ comment: '回答的答案', type: 'text', nullable: true })
  answer: string;

  @Column({ comment: '提問的token', nullable: true })
  promptTokens: number;

  @Column({ comment: '回答的token', nullable: true })
  completionTokens: number;

  @Column({ comment: '總花費的token', nullable: true })
  totalTokens: number;

  @Column({ comment: 'role system user assistant', nullable: true })
  role: string;

  @Column({ comment: '任務進度', nullable: true })
  progress: string;

  @Column({ comment: '任務狀態', nullable: true, default: 3 })
  status: number;

  @Column({ comment: '任務類型', nullable: true })
  action: string;

  @Column({ comment: '對圖片操作的按鈕ID', type: 'text', nullable: true })
  customId: string;

  @Column({ comment: '繪畫的ID每條不一樣', nullable: true })
  drawId: string;

  @Column({ comment: '文件資訊', nullable: true, type: 'text' })
  fileInfo: string;

  @Column({ comment: '對話轉語音的鏈接', nullable: true, type: 'text' })
  ttsUrl: string;

  @Column({ comment: '是否推薦0: 默認 1: 推薦', nullable: true, default: 0 })
  rec: number;

  @Column({ comment: '分組ID', nullable: true })
  groupId: number;

  @Column({ comment: '使用的應用id', nullable: true })
  appId: number;

  @Column({ comment: '是否刪除', default: false })
  isDelete: boolean;

  @Column({ comment: '任務ID', nullable: true })
  taskId: string;

  @Column({ comment: '任務數據', nullable: true, type: 'text' })
  taskData: string;

  @Column({ comment: '視頻Url', nullable: true, type: 'text' })
  videoUrl: string;

  @Column({ comment: '音頻Url', nullable: true, type: 'text' })
  audioUrl: string;

  @Column({ comment: '提問參考', nullable: true })
  promptReference: string;
}
