import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/entity/baseEntity';

@Entity({ name: 'verifycation' })
export class VerifycationEntity extends BaseEntity {
	@Column({ comment: '用戶id' })
	userId: number;

	@Column({ nullable: false, comment: '驗證類型' })
	type: number;

	@Column({ nullable: false, comment: '驗證碼' })
	code: number;

	@Column({ comment: '過期時間' })
	expiresAt: Date;

	@Column({ length: 64, nullable: false, comment: '發送的郵箱' })
	email: string;

	@Column({ default: 0, nullable: false, comment: '是否已經使用了' })
	used: number;
}
