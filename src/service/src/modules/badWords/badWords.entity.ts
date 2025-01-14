import { BaseEntity } from 'src/common/entity/baseEntity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'bad_words' })
export class BadWordsEntity extends BaseEntity {
  @Column({ length: 20, comment: '敏感詞' })
  word: string;

  @Column({ default: 1, comment: '敏感詞開啟狀態' })
  status: number;

  @Column({ default: 0, comment: '敏感詞觸發次數' })
  count: number;
}
