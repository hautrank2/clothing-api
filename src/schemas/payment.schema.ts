import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum PaymentMethod {
  COD = 'cod',
  MOMO = 'momo',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export type CategoryDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String }) // Transaction ID từ bên thứ 3 (Stripe, Momo, etc.)
  transactionId?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: String }) // Ghi chú nếu cần (lỗi, lý do thất bại, etc.)
  note?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
