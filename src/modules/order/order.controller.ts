import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from '../cart/cart.service';
import { concatMap, switchMap, throwError } from 'rxjs';
import { Cart } from 'src/schemas/cart.schema';
import { Item } from 'src/schemas/item.schema';
import { Product } from 'src/schemas/product.schema';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.cartService.findByUserId(dto.user).pipe(
      switchMap((cart: Cart | null) => {
        if (!cart) {
          return throwError(() => new BadRequestException('Cart not found'));
        }
        // delete item or reduce quantity
        cart.items = cart.items
          .map((item: Item) => {
            const orderItem = dto.items.find(orderItem => {
              return (
                orderItem.product ===
                  (item.product as Product)._id?.toString() &&
                orderItem.color === item.color &&
                orderItem.size === item.size
              );
            });
            if (orderItem) {
              item.quantity -= orderItem.quantity;
            }
            return item;
          })
          .filter(item => item.quantity > 0);

        return this.cartService.update(cart._id as string, cart).pipe(
          concatMap(cart => {
            // create order
            return this.orderService.create(dto);
          }),
        );
      }),
    );
  }

  @Get()
  findAll(@Query() query: { [key: string]: string }) {
    const { page, pageSize, ...filter } = query;
    return this.orderService.findByFilter(+page, +pageSize, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
