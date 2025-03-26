import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Item } from './item.schema';
import { Address } from './user.schema';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop([
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      size: { type: String, required: true },
      color: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String },
      imageUrl: { type: String },
    },
  ])
  items: Item[];

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: Address, required: true })
  shippingAddress: Address;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: 'pending',
  })
  status: OrderStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' })
  paymentId?: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  deliveredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
