import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // SNAPSHOT số tiền cần thu
  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true,
  })
  method: PaymentMethod;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // Chỉ dùng cho chuyển khoản
  @Prop({ type: String })
  transactionId?: string;

  // Thời điểm thu tiền thành công
  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: String })
  note?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
