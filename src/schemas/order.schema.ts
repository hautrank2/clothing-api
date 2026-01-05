import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Address } from './user.schema';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  })
  variantId: mongoose.Types.ObjectId;

  // SNAPSHOT
  @Prop({ required: true })
  productTitle: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true, min: 0 })
  price: number; // priceAtPurchase

  @Prop({ required: true, min: 1 })
  quantity: number;
}
@Schema({ _id: false })
export class OrderStatusTimestamps {
  @Prop() pendingAt?: Date;
  @Prop() confirmedAt?: Date;
  @Prop() paidAt?: Date;
  @Prop() shippedAt?: Date;
  @Prop() deliveredAt?: Date;
  @Prop() cancelledAt?: Date;
  @Prop() failedAt?: Date;
}

export const OrderStatusTimestampsSchema = SchemaFactory.createForClass(
  OrderStatusTimestamps,
);

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ type: Address, required: true })
  address: Address;

  @Prop({ required: true })
  phone: string;

  @Prop({
    type: OrderStatusTimestampsSchema,
    default: {},
  })
  statusTimestamps: OrderStatusTimestamps;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' })
  paymentId?: mongoose.Types.ObjectId;

  @Prop()
  deliveredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
