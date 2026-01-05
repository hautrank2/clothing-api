import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 🧾 CHECKOUT
  @Post()
  checkout(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.checkout(req.user.id, dto);
  }

  // 👤 Order của user
  @Get('me')
  getMyOrders(@Req() req: any) {
    return this.orderService.findByUser(req.user.id);
  }

  // 📦 Chi tiết order
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  // 🔧 ADMIN cập nhật status
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateStatus(id, dto);
  }
}
