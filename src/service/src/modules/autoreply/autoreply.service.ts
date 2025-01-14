import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AutoReplyEntity } from './autoreply.entity';
import { AddAutoReplyDto } from './dto/addAutoReply.dto';
import { DelAutoReplyDto } from './dto/delBadWords.dto';
import { QueryAutoReplyDto } from './dto/queryAutoReply.dto';
import { UpdateAutoReplyDto } from './dto/updateAutoReply.dto';

@Injectable()
export class AutoreplyService implements OnModuleInit {
  private autoReplyKes: { prompt: string; keywords: string[] }[] = [];
  private autoReplyMap = {};
  private autoReplyFuzzyMatch = true;

  constructor(
    @InjectRepository(AutoReplyEntity)
    private readonly autoReplyEntity: Repository<AutoReplyEntity>
  ) {}

  async onModuleInit() {
    await this.loadAutoReplyList();
  }

  async loadAutoReplyList() {
    const res = await this.autoReplyEntity.find({
      where: { status: 1 },
      select: ['prompt', 'answer', 'isAIReplyEnabled'],
    });
    this.autoReplyMap = {};
    this.autoReplyKes = [];

    res.forEach((t) => {
      this.autoReplyMap[t.prompt] = {
        answer: t.answer,
        isAIReplyEnabled: t.isAIReplyEnabled,
      };
      const keywords = t.prompt.split(' ').map((k) => k.trim()); // 關鍵詞以空格分詞
      this.autoReplyKes.push({ prompt: t.prompt, keywords });
    });
  }

  async checkAutoReply(prompt: string) {
    let answers = [];
    let isAIReplyEnabled = 0;
    const seenGroups = new Set<string>();

    // Logger.debug('checkAutoReply', prompt);
    // Logger.debug('checkAutoReply', this.autoReplyKes);
    // Logger.debug('autoReplyMap', this.autoReplyMap);

    if (this.autoReplyFuzzyMatch) {
      for (const item of this.autoReplyKes) {
        if (item.keywords.some((keyword) => prompt.includes(keyword))) {
          if (!seenGroups.has(item.prompt)) {
            answers.push(this.autoReplyMap[item.prompt].answer);
            seenGroups.add(item.prompt);
            if (this.autoReplyMap[item.prompt].isAIReplyEnabled === 1) {
              isAIReplyEnabled = 1;
            }
          }
        }
      }
    } else {
      const matches = this.autoReplyKes.filter(
        (item) => item.prompt === prompt
      );
      for (const match of matches) {
        if (!seenGroups.has(match.prompt)) {
          answers.push(this.autoReplyMap[match.prompt].answer);
          seenGroups.add(match.prompt);
          if (this.autoReplyMap[match.prompt].isAIReplyEnabled === 1) {
            isAIReplyEnabled = 1;
          }
        }
      }
    }

    return {
      answer: answers.join('\n'), // 拼接所有匹配到的答案
      isAIReplyEnabled,
    };
  }

  async queryAutoreply(query: QueryAutoReplyDto) {
    const { page = 1, size = 10, prompt, status } = query;
    const where: any = {};
    [0, 1, '0', '1'].includes(status) && (where.status = status);
    prompt && (where.prompt = Like(`%${prompt}%`));
    const [rows, count] = await this.autoReplyEntity.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { id: 'DESC' },
    });
    return { rows, count };
  }

  async addAutoreply(body: AddAutoReplyDto) {
    // 直接保存新的自動回覆
    await this.autoReplyEntity.save(body);
    // 重新加載自動回覆列表
    await this.loadAutoReplyList();
    return '添加問題成功！';
  }

  async updateAutoreply(body: UpdateAutoReplyDto) {
    const { id } = body;
    const res = await this.autoReplyEntity.update({ id }, body);
    if (res.affected > 0) {
      await this.loadAutoReplyList();
      return '更新問題成功';
    }
    throw new HttpException('更新失敗', HttpStatus.BAD_REQUEST);
  }

  async delAutoreply(body: DelAutoReplyDto) {
    const { id } = body;
    const z = await this.autoReplyEntity.findOne({ where: { id } });
    if (!z) {
      throw new HttpException(
        '該問題不存在,請檢查您的遞交資訊',
        HttpStatus.BAD_REQUEST
      );
    }
    const res = await this.autoReplyEntity.delete({ id });
    if (res.affected > 0) {
      await this.loadAutoReplyList();
      return '刪除問題成功';
    }
    throw new HttpException('刪除失敗', HttpStatus.BAD_REQUEST);
  }
}
