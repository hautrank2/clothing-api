import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@Req() req: any) {
    return this.cartService.getMyCart(req.user.id);
  }

  @Post('items')
  addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(
      req.user.id,
      dto.variantId,
      dto.size,
      dto.quantity,
    );
  }

  @Patch('items/:itemId')
  updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }
}
