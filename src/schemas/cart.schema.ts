import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { ProductSizeEnum, ProductVariant } from './product-variant.schema';

@Schema({ _id: true })
export class CartItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductVariant.name,
    required: true,
  })
  variantId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(ProductSizeEnum),
  })
  size: ProductSizeEnum;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  isCheckedOut: boolean;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: Types.DocumentArray<CartItem>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
