import { SuperAuthGuard } from './../../common/auth/superAuth.guard';
import { JwtAuthGuard } from '@/common/auth/jwtAuth.guard';
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { Request } from 'express';
import { BuyDto } from './dto/buy.dto';
import { QueryByOrderIdDto } from './dto/queryByOrder.dto';
import { AdminAuthGuard } from '@/common/auth/adminAuth.guard';
import { QuerAllOrderDto } from './dto/queryAllOrder.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /* 購買商品 */
  @Post('buy')
  @ApiOperation({ summary: '購買商品' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async buy(@Body() body: BuyDto, @Req() req: Request) {
    return this.orderService.buy(body, req);
  }

  /* 查詢訂單狀態 */
  @Get('queryByOrderId')
  @ApiOperation({ summary: '查詢訂單' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async queryByOrderId(@Req() req: Request, @Query() query: QueryByOrderIdDto) {
    const { id: userId } = req.user;
    return this.orderService.queryByOrderId(req, query);
  }

  /* 查詢所有訂單 */
  @Get('queryAll')
  @ApiOperation({ summary: '查詢所有訂單' })
  @UseGuards(AdminAuthGuard)
  async queryAllOrder(@Query() query: QuerAllOrderDto) {
    return this.orderService.queryAllOrder(query);
  }

  /* 刪除訂單 */
  @Post('delete')
  @ApiOperation({ summary: '刪除訂單' })
  @UseGuards(SuperAuthGuard)
  async deleteOrder(@Body() body: QueryByOrderIdDto) {
    return this.orderService.deleteOrder(body);
  }

   /* 刪除訂單 */
   @Post('deleteNotPay')
   @ApiOperation({ summary: '刪除未支付訂單' })
   @UseGuards(SuperAuthGuard)
   async deleteNotPay() {
     return this.orderService.deleteNotPay();
   }
}
