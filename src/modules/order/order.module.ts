import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { CartModule } from '../cart/cart.module';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import {
  ProductVariant,
  ProductVariantSchema,
} from 'src/schemas/product-variant.schema';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    CartModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
