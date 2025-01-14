import { AdminAuthGuard } from '@/common/auth/adminAuth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryStatisticDto } from './dto/queryStatisticDto.dto';
import { StatisticService } from './statistic.service';

@ApiTags('statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('base')
  @ApiOperation({ summary: '獲取基礎統計數據' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getBaseStatistic() {
    return this.statisticService.getBaseStatistic();
  }

  @Get('chatStatistic')
  @ApiOperation({ summary: '獲取聊天繪畫統計數據' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getChatStatistic(@Query() params: QueryStatisticDto) {
    return this.statisticService.getChatStatistic(params);
  }

  @Get('baiduVisit')
  @ApiOperation({ summary: '獲取百度統計數據' })
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  getBaiduStatistics(@Query() params: QueryStatisticDto) {
    return this.statisticService.getBaiduVisit(params);
  }
}
