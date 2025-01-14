import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ length: 12, comment: '用戶暱稱' })
  username: string;

  @Column({ length: 64, comment: '用戶密碼', nullable: true })
  password: string;

  @Column({ default: 0, comment: '用戶狀態' })
  status: number;

  @Column({ default: 1, comment: '用戶性別' })
  sex: number;

  @Column({ length: 64, unique: true, comment: '用戶郵箱' })
  email: string;

  @Column({ length: 64, nullable: true, comment: '用戶手機號' })
  phone: string;

  @Column({
    length: 300,
    nullable: true,
    default: '',
    comment: '用戶頭像',
  })
  avatar: string;

  @Column({
    length: 300,
    nullable: true,
    default:
      '我是一臺基於深度學習和自然語言處理技術的 AI 機器人，旨在為用戶提供高效、精準、個性化的智能服務。',
    comment: '用戶簽名',
  })
  sign: string;

  @Column({ length: 64, default: '', comment: '註冊IP', nullable: true })
  registerIp: string;

  @Column({
    length: 64,
    default: '',
    comment: '最後一次登錄IP',
    nullable: true,
  })
  lastLoginIp: string;

  @Column({ length: 10, default: '', comment: '用戶邀請碼' })
  inviteCode: string;

  @Column({ length: 10, default: '', comment: '用戶填寫的別人的邀請碼' })
  invitedBy: string;

  @Column({ length: 10, default: 'viewer', comment: '用戶角色' })
  role: string;

  @Column({ length: 64, default: '', comment: '微信openId', nullable: true })
  openId: string;

  @Column({ length: 64, comment: '用戶註冊來源', nullable: true })
  client: string;

  @Column({ comment: '用戶邀請鏈接被點擊次數', default: 0 })
  inviteLinkCount: number;

  @Column({ comment: '用戶連續簽到天數', default: 0 })
  consecutiveDays: number;

  @Column({ comment: '用戶違規記錄次數', default: 0 })
  violationCount: number;

  @Column({ comment: '真實姓名', nullable: true })
  realName: string;

  @Column({ comment: '身份證號', nullable: true })
  idCard: string;
}
