import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { from, mergeMap, map, throwError } from 'rxjs';
import { Order, OrderStatus } from 'src/schemas/order.schema';
import { Cart } from 'src/schemas/cart.schema';
import { ProductVariant } from 'src/schemas/product-variant.schema';
import { Payment, PaymentStatus } from 'src/schemas/payment.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(ProductVariant.name)
    private variantModel: Model<ProductVariant>,
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
  ) {}

  /* ======================
     CHECKOUT
  ====================== */
  checkout(userId: string, dto: CreateOrderDto) {
    return from(this.cartModel.findOne({ userId }).exec()).pipe(
      mergeMap(cart => {
        if (!cart || cart.items.length === 0) {
          return throwError(() => new BadRequestException('Cart is empty'));
        }

        const activeItems = cart.items.filter(i => !i.isCheckedOut);
        if (!activeItems.length) {
          return throwError(() => new BadRequestException('No active items'));
        }

        return from(
          this.variantModel
            .find({
              _id: { $in: activeItems.map(i => i.variantId) },
            })
            .exec(),
        ).pipe(
          mergeMap(variants => {
            // Validate stock
            for (const item of activeItems) {
              const variant = variants.find(
                v =>
                  (v._id as Types.ObjectId).toString() ===
                  item.variantId.toString(),
              );
              if (!variant || variant.stock < item.quantity) {
                return throwError(
                  () => new BadRequestException('Variant out of stock'),
                );
              }
            }

            // SNAPSHOT order items
            const orderItems = activeItems.map(item => {
              const v = variants.find(
                x =>
                  (v._id as Types.ObjectId).toString() ===
                  item.variantId.toString(),
              )!;
              return {
                productId: v.productId,
                variantId: v._id,
                productTitle: v.productTitle,
                sku: v.sku,
                color: v.color,
                size: v.size,
                price: v.price,
                quantity: item.quantity,
              };
            });

            const subtotal = orderItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0,
            );
            const shippingFee = 0; // TODO config
            const totalPrice = subtotal + shippingFee;

            return from(
              this.orderModel.create({
                userId,
                items: orderItems,
                subtotal,
                shippingFee,
                totalPrice,
                address: dto.address,
                phone: dto.phone,
                status: OrderStatus.PENDING,
                statusTimestamps: { pendingAt: new Date() },
              }),
            ).pipe(
              mergeMap(order =>
                // Create Payment
                from(
                  this.paymentModel.create({
                    orderId: order._id,
                    userId,
                    amount: totalPrice,
                    method: dto.paymentMethod,
                    status: PaymentStatus.PENDING,
                  }),
                ).pipe(
                  mergeMap(() => {
                    // Mark cart items checked out
                    activeItems.forEach(i => (i.isCheckedOut = true));
                    return from(cart.save()).pipe(map(() => order));
                  }),
                ),
              ),
            );
          }),
        );
      }),
    );
  }

  /* ======================
     QUERY
  ====================== */
  findByUser(userId: string) {
    return from(this.orderModel.find({ userId }).lean().exec());
  }

  findOne(id: string) {
    return from(this.orderModel.findById(id).lean().exec());
  }

  updateStatus(id: string, dto: { status?: OrderStatus }) {
    if (!dto.status) return null;
    const update: any = { status: dto.status };

    // set timestamp
    update[`statusTimestamps.${dto.status}At`] = new Date();

    return from(this.orderModel.findByIdAndUpdate(id, update, { new: true }));
  }
}
